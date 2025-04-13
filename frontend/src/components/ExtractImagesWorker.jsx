import React, { useRef, useState, useEffect } from 'react';
import FileInput from './FileInput';
import LoadingButton from './LoadingButton';
import ProgressBar from './ProgressBar';
import { runTask } from '../utils/workerClient';

const ExtractImagesWorker = () => {
  const fileInputRef = useRef();
  const [ignoreSmask, setIgnoreSmask] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [progressMessage, setProgressMessage] = useState("");
  const containerRef = useRef();
  const blobUrls = useRef(new Set());

  useEffect(() => {
    return () => {
      for (const url of blobUrls.current) {
        URL.revokeObjectURL(url);
      }
      blobUrls.current.clear();
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []);

  const handleExtractImages = async () => {
    if (!fileInputRef.current) return;

    setLoading(true);
    const { file } = fileInputRef.current.getFilesWithPageRanges()[0];
    const buffer = await file.arrayBuffer();

    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }
    for (const url of blobUrls.current) URL.revokeObjectURL(url);
    blobUrls.current.clear();

    const pageRange = fileInputRef.current.getFilesWithPageRanges()[0].pageRange;
    runTask('extractImages', { buffer, ignoreSmask, pageRange })
      .onPartial((data) => {
        console.log("Partial result:", data);
        const blob = new Blob([data.buffer], { type: data.mime });
        const url = URL.createObjectURL(blob);
        blobUrls.current.add(url);

        const link = document.createElement("a");
        link.href = url;
        link.download = data.name;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        const img = document.createElement("img");
        img.src = url;
        img.alt = data.name;
        img.style.maxWidth = "100%";
        img.style.maxHeight = "200px";
        img.style.objectFit = "contain";

        const caption = document.createElement("p");
        caption.className = "text-sm truncate";
        caption.textContent = data.name;

        link.appendChild(img);
        link.appendChild(caption);

        const wrapper = document.createElement("div");
        wrapper.className = "space-y-2";
        wrapper.appendChild(link);

        containerRef.current.appendChild(wrapper);


      })
      .onProgress((percent, message) => {
        console.log(`Progress: ${percent}% - ${message}`);
        setProgress(percent);
        setProgressMessage(message);
      })
      .then(() => {
        setLoading(false);
        console.log("All images extracted.");
      })
      .catch((err) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }
        for (const url of blobUrls.current) URL.revokeObjectURL(url);
        blobUrls.current.clear();
        setLoading(false);
        console.error("Extraction failed:", err);
      });
  };

  return (
    <div>
      <FileInput
        ref={fileInputRef}
        enablePageRange={true}
        acceptedFileTypes="application/pdf"
        allowMultiple={false}
      />
      <label className='block'>
        <input
          type="checkbox"
          checked={ignoreSmask}
          onChange={(e) => setIgnoreSmask(e.target.checked)}
        />
        Ignore soft masks
      </label>
      <LoadingButton loading={loading} className="btn" onClick={handleExtractImages}>
        Extract Images
      </LoadingButton>
      {progress !== null && (
        <ProgressBar percent={progress} message={progressMessage} />)}
      <div ref={containerRef} className='grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full'></div>
    </div>
  );
};

export default ExtractImagesWorker;
