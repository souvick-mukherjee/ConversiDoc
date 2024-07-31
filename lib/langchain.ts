import { ChatOpenAI } from "@langchain/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import pineconeClient from "./pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { PineconeConflictError } from "@pinecone-database/pinecone/dist/errors";
import { Index, RecordMetadata } from "@pinecone-database/pinecone";
import { adminDb } from "../firebaseAdmin";
import { auth } from "@clerk/nextjs/server";

// Initialise OpenAI model with API key and model name
const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
});

export const indexName = "souvickm";

async function fetchMessagesFromDB(docId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not found");
  }

  const chats = await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .doc(docId)
    .collection("chat")
    .orderBy("createdAt", "desc")
    .get();

const chatHistory = chats.docs.map((doc)=>
doc.data().role === "human"
? new HumanMessage(doc.data().message)
: new AIMessage(doc.data().message)
);

console.log(`--- Fetching last ${chatHistory.length} messages successfully ---`);
console.log(chatHistory.map((msg) => msg.content.toString()));

return chatHistory;
}

export async function generateDocs(docId: string) {
  const { userId } = await auth();

  if (!userId) throw new Error("User not found");

  console.log("--- Fetching download URL from Firebase... ---");
  const firebaseRef = await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .doc(docId)
    .get();
  
    console.log(`ref data: ${firebaseRef.data()}`);

  const downloadURL = firebaseRef.data()?.downloadURL;

  if (!downloadURL) {
    throw new Error("Download URL not found");
  }

  console.log(`--- Download URL fetched successfully: ${downloadURL} ---`);

  // Fetch the PDF from the specified URL
  const response = await fetch(downloadURL);

  // Load the PDF into a PDFDocument object
  const data = await response.blob();

  // Load the PDF document from the specified path
  console.log("--- Loading PDF document... ---");
  const loader = new PDFLoader(data);
  const docs = await loader.load();

  // Split the loaded document into smaller parts for easier processing
  console.log("--- Splitting document into smaller parts... ---");
  const splitter = new RecursiveCharacterTextSplitter();
  const splitDocs = await splitter.splitDocuments(docs);
  console.log(`--- Split into ${splitDocs.length} parts ---`);

  return splitDocs;
}

async function namespaceExists(
  index: Index<RecordMetadata>,
  namespace: string
) {
  if (namespace === null) throw new Error("No namespace value provided");
  const { namespaces } = await index.describeIndexStats();
  return namespaces?.[namespace] !== undefined;
}

export async function generateEmbeddingsInPineconeVectorStorage(docId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not found");
  }
  let piconeVectorStore;

  // Generate embeddings for split documents

  console.log("--- Generating embeddings... ---");
  const embeddings = new OpenAIEmbeddings();

  const index = await pineconeClient.index(indexName);
  const namespaceAlreadyExists = await namespaceExists(index, docId);

  if (namespaceAlreadyExists) {
    console.log(
      `--- Namespace ${docId} already exists, reusing existing embeddings ---`
    );

    piconeVectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      namespace: docId,
    });
    return piconeVectorStore;
  } else {
    // if namespace does not exit, download the pdf from firestore via the stored download URL & generate the embeddings and store them in Pinecone vector store
    const splitDocs = await generateDocs(docId);

    console.log(
      `--- Storing the embeddings in namespace ${docId} in the ${indexName} Pinecone vector store... ---`
    );

    piconeVectorStore = await PineconeStore.fromDocuments(
      splitDocs,
      embeddings,
      {
        pineconeIndex: index,
        namespace: docId,
      }
    );
    return piconeVectorStore;
  }
}

const generateLangchainCompletion = async (docId: string, question: string) => {
  let pineconeVectorStore;

  pineconeVectorStore = await generateEmbeddingsInPineconeVectorStorage(docId);

  if (!pineconeVectorStore) {
    throw new Error("Pinecone vector store not found");
  }

  // Create a retriever to search through the vector store
  console.log("--- Creating a retriever... ---");
  const retriever = pineconeVectorStore.asRetriever();

  // Fetch the chat history from database
  const chatHistory = await fetchMessagesFromDB(docId);

  console.log("--- Creating a prompt template... ---");
  const historyAwarePrompt = ChatPromptTemplate.fromMessages([
    ...chatHistory, // Insert the actual chat history here
  ["user", "{input}"],
  ["user", "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation",]
  ]);

// Create a history-aware retriever chain that uses the model, retriever, and prompt
console.log("--- Creating a history-aware retriever chain... ---");
 const historyAwareRetrieverChain = await createHistoryAwareRetriever({
  llm: model,
  retriever,
  rephrasePrompt: historyAwarePrompt,
 });
 
 // Define a prompt template for answering questions based on retrieved context
 console.log("--- Defining a prompt template for answering questions... ---");
 const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "Answer the user's questions based on the below context:\n\n{context}",
  ],
  ...chatHistory, // Insert the actual chat history here
  ["user", "{input}"],
 ]);

  // Create a chain to combine the retrieved documents into a coherent response
  console.log("--- Creating a document combining chain... ---");
const  historyAwareCombineDocsChain = await createStuffDocumentsChain({
  llm: model,
  prompt: historyAwareRetrievalPrompt,
});

// Create the main retrieval chain that combines the history-aware retriever and document combining chains
console.log("--- Creating the main retrieval chain... ---");
const conversationalRetrievalChain = await createRetrievalChain({
  retriever : historyAwareRetrieverChain,
  combineDocsChain: historyAwareCombineDocsChain,
});

console.log("--- Running the chain with a sample conversation... ---");
const reply = conversationalRetrievalChain.invoke({
  chat_history: chatHistory,
  input: question,
});

// Print the result to the console
console.log((await reply).answer);
return (await reply).answer;

};

// Export the model and the run function
export { model, generateLangchainCompletion };