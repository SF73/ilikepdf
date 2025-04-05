import React, { useRef, useState, useEffect } from 'react';
import FileInput from './FileInput';
import { usePyodide } from './PyodideProvider';
import LoadingButton from './LoadingButton';
import { getPdfMetadata, setPdfMetadata } from '../utils/pymupdfUtils';

const MetadataEditor = () => {
  const fileInputRef = useRef();
  const { pyodide, loading, pymupdf } = usePyodide();
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const handleProcessFiles = async () => {
    if (!pymupdf) {
      console.warn("Package is still loading");
      return;
    }
    if (fileInputRef.current) {
      const { file } = fileInputRef.current.getFilesWithPageRanges()[0];
      const metadata = await getPdfMetadata(pymupdf, pyodide, file);
      const metadataJson = JSON.stringify(metadata, null, 2);
      document.getElementById("output").value = metadataJson;
    }
  };

  const handleSetAndDownload = async () => {
    if (!pymupdf) {
      console.warn("Package is still loading");
      return;
    }
    if (fileInputRef.current) {
      const { file } = fileInputRef.current.getFilesWithPageRanges()[0];
      const newMetadata = JSON.parse(document.getElementById("output").value);
      const updatedBlob = await setPdfMetadata(pymupdf, pyodide, file, newMetadata);

      // Release the previous blob URL if it exists
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }

      const newBlobUrl = URL.createObjectURL(updatedBlob);
      setBlobUrl(newBlobUrl);

      const iframe = document.getElementById("pdfPreview");
      iframe.src = newBlobUrl;
    }
  };

  return (
    <div>
      <FileInput ref={fileInputRef} enablePageRange={false} acceptedFileTypes="application/pdf" allowMultiple={false} />
      <LoadingButton className='btn' loading={loading} onClick={handleProcessFiles}>Get Metadata</LoadingButton>
      <LoadingButton className='btn' loading={loading} onClick={handleSetAndDownload}>Set and Display PDF</LoadingButton>
      <textarea id="output" rows="10" cols="50" style={{ display: "block", marginTop: "10px" }}></textarea>
      <iframe id="pdfPreview" style={{ width: "100%", height: "500px", marginTop: "10px", border: "1px solid #ccc" }}></iframe>
    </div>
  );
};

export default MetadataEditor;
