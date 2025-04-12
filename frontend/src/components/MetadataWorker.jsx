import React, { useRef, useState, useEffect } from 'react';
import FileInput from './FileInput';
import LoadingButton from './LoadingButton';
import { runTask } from '../utils/workerClient';

const MetadataWorker = () => {
  const fileInputRef = useRef();
  const [blobUrl, setBlobUrl] = useState(null);
  const [fileName, setFileName] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const handleProcessFiles = async () => {
    if (fileInputRef.current) {
      const { file } = fileInputRef.current.getFilesWithPageRanges()[0];
      const buffer = await file.arrayBuffer();

      try {
        setLoading(true);
        const metadata = await runTask('getPdfMetadata', { buffer });
        const metadataJson = JSON.stringify(metadata, null, 2);
        document.getElementById("output").value = metadataJson;
      } catch (err) {
        console.error("Failed to get metadata:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSetAndDownload = async () => {
    if (fileInputRef.current) {
      const { file } = fileInputRef.current.getFilesWithPageRanges()[0];
      const buffer = await file.arrayBuffer();
      const newMetadata = JSON.parse(document.getElementById("output").value);
      const filename = file.name || "updated.pdf";
      try {
        setLoading(true);
  
        if (blobUrl) {
          URL.revokeObjectURL(blobUrl);
        }
  
        const { buffer: updatedBuffer, mime, name } = await runTask("setPdfMetadata", {
          buffer,
          newMetadata
        });
  
        const blob = new Blob([updatedBuffer], { type: mime });
        const url = URL.createObjectURL(blob);
        

        setBlobUrl(url);
        setFileName(filename);

      } catch (err) {
        console.error("Failed to set metadata:", err);
      } finally {
        setLoading(false);
      }
    }
  };  

  return (
    <div>
      <FileInput
        ref={fileInputRef}
        enablePageRange={false}
        acceptedFileTypes="application/pdf"
        allowMultiple={false}
      />
      <LoadingButton className="btn" loading={loading} onClick={handleProcessFiles}>
        Get Metadata
      </LoadingButton>
      <LoadingButton className="btn" loading={loading} onClick={handleSetAndDownload}>
        Set and Display PDF
      </LoadingButton>
      <textarea
        id="output"
        rows="10"
        cols="50"
        style={{ display: "block", marginTop: "10px" }}
      ></textarea>
{blobUrl && (
  <div className="mt-4">
    <a
      href={blobUrl}
      download={fileName}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
    >
      📄 Download or Preview: {fileName}
    </a>
  </div>
)}
    </div>
  );
};

export default MetadataWorker;
