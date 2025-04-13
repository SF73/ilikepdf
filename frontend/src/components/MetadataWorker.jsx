import React, { useRef, useState, useEffect } from 'react';
import FileInput from './FileInput';
import LoadingButton from './LoadingButton';
import { runTask } from '../utils/workerClient';
import PdfPreviewCard from './PdfPreviewCard';

const MetadataWorker = () => {
  const fileInputRef = useRef();
  const [blob, setBlob] = useState(null);
  const [fileName, setFileName] = useState(null);

  const [loading, setLoading] = useState(false);

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

        const { buffer: updatedBuffer, mime, name } = await runTask("setPdfMetadata", {
          buffer,
          newMetadata
        });

        setBlob(new Blob([updatedBuffer], { type: mime }));
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
        Set Metadata
      </LoadingButton>
      <textarea
        id="output"
        rows="12"
        className="my-4 w-full p-2 border border-gray-300 rounded-md"
      ></textarea>
      {blob && <PdfPreviewCard blob={blob} blobName={fileName} autoPreview={false} />}
    </div>
  );
};

export default MetadataWorker;
