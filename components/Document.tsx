'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import byteSize from 'byte-size';

function Document({
    id,
    name,
    size,
    downloadURL
    }: {
    id: string;
    name: string;
    size: number;
    downloadURL: string;
}) {

const router = useRouter();

  return (
    <div className='flex flex-col w-64 h-80 rounded-xl bg-white drop-shadow-md justify-between p-4 transition-all transform hover:scale-105 hover:bg-indigo-600 hover:text-white cursor-pointer group'>
        <div 
        className='flex-1'
        onClick={()=>{
            router.push(`/dashboard/files/${id}`);
        }}>
            <p className='font-semibold line-clamp-2'>{name}</p>
            {/* Render size in KBs */}
            {byteSize(size).value} KB
        </div>
    </div>
  )
}

export default Document