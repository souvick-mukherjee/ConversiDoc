import React from "react";
import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/firebaseAdmin";
import PdfView from "@/components/PdfView";
import Chat from "@/components/Chat";

async function ChatToFilePage({
  params: { id },
}: {
  params: {
    id: string;
  };
}) {
  auth().protect();
  const { userId } = await auth();

  const ref = await adminDb
    .collection("users")
    .doc(userId!)
    .collection("files")
    .doc('da3d189c-01c5-445b-b368-12b5f5c26a61')
    .get();

  const url = ref.data()?.downloadURL;

  
  // console.log(`param ID: ${id}`);
  // console.log(`User ID: ${userId}`);
  // console.log(`Download URL: ${url}`);

  return (
    <div className="grid lg:grid-cols-5 h-full overflow-hidden">
      {/* Right */}
      <div className="col-span-5 lg:col-span-2 overflow-y-auto">
        <Chat id={id} />
      </div>

      {/* Left */}
      <div className="col-span-5 lg:col-span-3 bg-gray-100 border-r-2 lg:border-indigo-600 lg:-order-1 overflow-auto">
        <PdfView url={url} />
      </div>
    </div>
  );
}

export default ChatToFilePage;
