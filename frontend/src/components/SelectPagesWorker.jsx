import React, { useRef, useState } from 'react';
import FileInput from './FileInput';
import LoadingButton from './LoadingButton';
import { runTask } from '../utils/workerClient';
import PdfPreviewCard from './PdfPreviewCard';

const SelectPagesWorker = () => {
  const fileInputRef = useRef();
  const [blob, setBlob] = useState(null);
  const [blobName, setBlobName] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = async () => {
    if (!fileInputRef.current) return;

    const { file } = fileInputRef.current.getFilesWithPageRanges()[0];
    const sequence = document.getElementById("sequenceInput").value;
    const buffer = await file.arrayBuffer();

    try {
      setLoading(true);
      const { buffer: newBuffer, mime } = await runTask("selectPages", {
        buffer,
        splits: sequence,
      });

      setBlob(new Blob([newBuffer], { type: mime }));
      setBlobName(file.name);
    } catch (err) {
      console.error("Failed to select pages:", err);
    } finally {
      setLoading(false);
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

      <textarea
        id="sequenceInput"
        placeholder={`Enter a comma-separated list of Python slices, example\n1, 2, 5:10`}
        rows="5"
        className="w-full p-2 border border-gray-300 rounded-md"
      ></textarea>

      <LoadingButton className="btn" loading={loading} onClick={handleSelect}>
        Select Pages
      </LoadingButton>

      {blob && <PdfPreviewCard blob={blob} blobName={blobName} autoPreview={false} />}

    </div>
  );
};

export default SelectPagesWorker;
