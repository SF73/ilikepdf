import React, { useRef } from 'react';
import FileInput from './FileInput';
import { usePyodide } from './PyodideProvider';

const MetadataExtractor = () => {
  const fileInputRef = useRef();
  const {pyodide, mypkg} = usePyodide();

  const handleProcessFiles = async () => {
    if (!mypkg) {
      console.warn("Package is still loading");
      return;
    }
    if (fileInputRef.current) {
      // Retrieve the array of objects: { file, pageRange }
      const fileData = fileInputRef.current.getFilesWithPageRanges();
      
      // Process each file (convert to ArrayBuffer) and log page ranges
      const processedFiles = await Promise.all(
        fileData.map(async ({ file, pageRange }) => {
          const buffer = await file.arrayBuffer();
          // const bufferView = new Uint8Array(buffer);
          // const toto = pyodide.ffi.JsBuffer(bufferView);
          const doc = mypkg.Document.callKwargs({stream:pyodide.toPy(buffer)});
          const metadata = doc.metadata;
          console.log("Metadata:", metadata.toJs({dict_converter : Object.fromEntries}));
          doc.close();
          return { metadata };
        })
      );
      
      console.log("Processed Files:", processedFiles);
    }
  };

  return (
    <div>
      <FileInput ref={fileInputRef} enablePageRange={true} acceptedFileTypes="application/pdf" allowMultiple={false}/>
      <button onClick={handleProcessFiles}>Process File</button>
    </div>
  );
};

export default MetadataExtractor;
