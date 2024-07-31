'use server';

import { generateEmbeddingsInPineconeVectorStorage } from "@/lib/langchain";
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache";

export async function generateEmbeddings(docId: string){
    auth().protect();

    // turn PDF into embeddings
    await generateEmbeddingsInPineconeVectorStorage(docId);

    revalidatePath("/dashboard");

    return {completed: true};
}