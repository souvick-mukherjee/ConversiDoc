import React from 'react'
import PlaceholderDocument from './PlaceholderDocument'
import { auth } from '@clerk/nextjs/server'
import { adminDb } from '@/firebaseAdmin';
import Document from './Document';

async function Documents() {
auth().protect();
const { userId } = await auth();

if (!userId) {
  throw new Error("User not found");
}

const documentsSnapshots = await adminDb.collection("users").doc(userId).collection("files").get();

  return (
    <div className='flex flex-wrap p-5 bg-gray-100 justify-center lg:justify-start rounded-sm gap-5 max-w-7xl mx-auto'>

{/* Map through the documents */}

{documentsSnapshots.docs.map((doc) => {
  const { name, downloadURL, size } = doc.data();

  return (
    <Document
    key={doc.id}
    id={doc.id}
    name={name}
    size={size}
    downloadURL={downloadURL}
    />
  )
})}

    <PlaceholderDocument/>
    </div>
  )
}

export default Documents