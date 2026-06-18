# ConversiDoc - Detailed Overview

**ConversiDoc** is an AI-powered document chat application that transforms static PDFs into interactive conversations. Here's a comprehensive breakdown:

## 🎯 Core Purpose
Turn PDF documents into conversational AI assistants. Users upload PDFs and can ask questions, get summaries, and have natural conversations about the document content.

## 🏗️ Technology Stack

### Frontend & Framework
- **Next.js 14.2.5** - React framework
- **TypeScript** - 94.8% of codebase
- **Tailwind CSS + DaisyUI** - Styling
- **React PDF Viewer** - Display PDFs in browser
- **Lucide React** - UI icons

### Authentication & User Management
- **Clerk** - User authentication and management

### AI & LLM
- **LangChain** - LLM orchestration framework
- **OpenAI Embeddings** - Convert text to vector embeddings
- **LangChain OpenAI** - ChatGPT integration

### Vector Database & Storage
- **Pinecone** - Vector database for storing PDF embeddings
- **Firebase Firestore** - Store PDF metadata and document references
- **Firebase Storage** - Cloud storage for uploaded PDFs
- **Firebase Admin SDK** - Backend Firebase operations

### File Processing
- **pdf-parse** - Extract text from PDFs
- **react-dropzone** - File upload UI
- **react-markdown** - Render markdown responses
- **@react-pdf/renderer** - PDF generation

## 📋 Key Features (from homepage)

1. **Store PDF Documents** - Securely upload and store PDFs
2. **Blazing Fast Responses** - Quick AI-powered answers
3. **Chat Memorization** - Maintains conversation history context
4. **Interactive PDF Viewer** - View PDFs while chatting
5. **Cloud Backup** - Automatic Firebase backup
6. **Responsive Design** - Works on desktop, tablet, mobile

## 🔄 Data Flow

1. **Upload Phase**: User uploads PDF → Firebase Storage
2. **Processing Phase**: 
   - Extract text from PDF
   - Split into chunks for processing
   - Generate vector embeddings using OpenAI
   - Store embeddings in Pinecone vector database
3. **Query Phase**:
   - User asks a question
   - Convert question to embeddings
   - Search similar chunks in Pinecone
   - Use LangChain to generate contextual response with ChatGPT

## 📂 Project Structure
- **`app/`** - Next.js app router pages (landing page, dashboard)
- **`components/`** - React UI components
- **`lib/langchain.ts`** - PDF processing and embedding generation logic
- **`hooks/useUpload.ts`** - File upload handling with progress tracking
- **`actions/generateEmbeddings.ts`** - Server action for async embedding generation
- **`firebase.ts`** - Firebase configuration

## 🌐 Deployment
- **Live deployment**: https://chat-with-pdf-delta.vercel.app
- **Hosted on**: Vercel

## 📊 Current Status
- Created: July 24, 2024
- Last updated: August 2, 2024
- 662 KB repository size
- Public repository (no forks/stars yet)

This is a production-ready application that leverages modern AI/ML tools to create a sophisticated document interaction experience.
