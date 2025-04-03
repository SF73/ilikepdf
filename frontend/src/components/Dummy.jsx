import React, { useRef } from 'react';
import FileInput from './FileInput';

const Dummy = () => {
  const fileInputRef = useRef();

  const handleProcessFiles = async () => {
    if (fileInputRef.current) {
      // Retrieve the array of objects: { file, pageRange }
      const fileData = fileInputRef.current.getFilesWithPageRanges();
      
      // Process each file (convert to ArrayBuffer) and log page ranges
      const processedFiles = await Promise.all(
        fileData.map(async ({ file, pageRange }) => {
          const buffer = await file.arrayBuffer();
          return { buffer, pageRange, fileName: file.name };
        })
      );
      
      console.log("Processed Files:", processedFiles);
    }
  };

  return (
    <div>
      <FileInput ref={fileInputRef} enablePageRange={true} acceptedFileTypes="application/pdf"/>
      <button onClick={handleProcessFiles}>Process Files</button>
    </div>
  );
};

export default Dummy;
