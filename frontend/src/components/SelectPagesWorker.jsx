import React, { useRef, useState } from 'react';
import FileInput from './FileInput';
import LoadingButton from './LoadingButton';
import { runTask } from '../utils/workerClient';

const SelectPagesWorker = () => {
  const fileInputRef = useRef();
  const [blobUrl, setBlobUrl] = useState(null);
  const [blobName, setBlobName] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = async () => {
    if (!fileInputRef.current) return;

    const { file } = fileInputRef.current.getFilesWithPageRanges()[0];
    const sequence = document.getElementById("sequenceInput").value;
    const buffer = await file.arrayBuffer();

    try {
      setLoading(true);
      if (blobUrl) URL.revokeObjectURL(blobUrl);

      const { buffer: newBuffer, mime } = await runTask("selectPages", {
        buffer,
        splits: sequence,
      });

      const blob = new Blob([newBuffer], { type: mime });
      const url = URL.createObjectURL(blob);

      setBlobUrl(url);
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

      {blobUrl && (
        <div className="mt-4">
          <a
            href={blobUrl}
            download={blobName}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            📄 Preview or Download: {blobName}
          </a>

          <iframe
            src={blobUrl}
            style={{
              width: "100%",
              height: "500px",
              marginTop: "10px",
              border: "1px solid #ccc",
            }}
            title="New PDF"
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default SelectPagesWorker;
