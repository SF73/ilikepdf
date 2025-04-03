import React, { useRef, useState } from 'react';
import FileInput from './FileInput';
import { usePyodide } from './PyodideProvider';

const MetadataEditor = () => {
  const fileInputRef = useRef();
  const { pyodide, mypkg } = usePyodide();
  const [blobUrl, setBlobUrl] = useState(null); // State to store the blob URL

  const handleProcessFiles = async () => {
    if (!mypkg) {
      console.warn("Package is still loading");
      return;
    }
    if (fileInputRef.current) {
      const { file, pageRange } = fileInputRef.current.getFilesWithPageRanges()[0]; // Single file
      const buffer = await file.arrayBuffer();
      const doc = mypkg.Document.callKwargs({ stream: pyodide.toPy(buffer) });
      const metadata = doc.metadata;
      const metadataJson = JSON.stringify(metadata.toJs({ dict_converter: Object.fromEntries }), null, 2);
      console.log("Metadata:", metadataJson);
      doc.close();
      document.getElementById("output").value = metadataJson; // Set metadata in textarea
    }
  };

  const handleSetAndDownload = async () => {
    if (!mypkg) {
      console.warn("Package is still loading");
      return;
    }
    if (fileInputRef.current) {
      const { file } = fileInputRef.current.getFilesWithPageRanges()[0]; // Single file
      const buffer = await file.arrayBuffer();
      const doc = mypkg.Document.callKwargs({ stream: pyodide.toPy(buffer) });

      const newMetadata = JSON.parse(document.getElementById("output").value); // Get metadata from textarea
      doc.set_metadata(pyodide.toPy(newMetadata)); // Use set_metadata to update metadata

      const updatedBuffer = doc.write(); // Write updated document
      doc.close();

      // Release the previous blob URL if it exists
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }

      const newBlob = new Blob([updatedBuffer.toJs()], { type: "application/pdf" });
      const newBlobUrl = URL.createObjectURL(newBlob);
      setBlobUrl(newBlobUrl); // Store the new blob URL in state

      const iframe = document.getElementById("pdfPreview");
      iframe.src = newBlobUrl; // Set iframe source to the updated PDF
    }
  };

  return (
    <div>
      <FileInput ref={fileInputRef} enablePageRange={false} acceptedFileTypes="application/pdf" allowMultiple={false} />
      <button onClick={handleProcessFiles}>Get Metadata</button>
      <button onClick={handleSetAndDownload}>Set and Display PDF</button>
      <textarea id="output" rows="10" cols="50" style={{ display: "block", marginTop: "10px" }}></textarea>
      <iframe id="pdfPreview" style={{ width: "100%", height: "500px", marginTop: "10px", border: "1px solid #ccc" }}></iframe>
    </div>
  );
};

export default MetadataEditor;
