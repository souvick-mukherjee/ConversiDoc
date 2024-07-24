"use client";
import React,{useCallback} from 'react';
import {useDropzone} from 'react-dropzone';
import { CheckCircleIcon,
    CircleArrowDown,
    HammerIcon,
    RocketIcon,
    SaveIcon
 } from "lucide-react";



function FilelUploader() {
    const onDrop = useCallback((acceptedFiles : File[]) => {
        console.log(acceptedFiles);
      }, [])
      const {getRootProps, getInputProps, isDragActive, isFocused, isDragAccept} = useDropzone({onDrop})
    


  return (
    <div className='flex flex-col items-center mx-auto max-w-7xl gap-4'>
    <div {...getRootProps()}
    className={`p-10 border-2 border-dashed mt-10 w-[90%] text-indigo-600 border-indigo-600 rounded-lg h-96 flex items-center justify-center
    ${isFocused || isDragAccept ? "bg-indigo-300" : "bg-indigo-100" }`}
    >
      <input {...getInputProps()} />
      <div className='flex flex-col justify-center items-center'>
      {
        isDragActive ?
        <>
        <RocketIcon className='w-20 h-20 animate-ping'/>
        <p>Drop the files here ...</p> 
        </>:
        <>
        <CircleArrowDown className='w-20 h-20 animate-bounce'/>
        <p>Drag &apos;n&apos; drop some files here, or click to select files</p>
        </>
      }
      </div>
    </div>
    </div>
  )
  
}

export default FilelUploader