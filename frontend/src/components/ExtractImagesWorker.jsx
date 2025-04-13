import React, { useRef, useState, useEffect } from 'react';
import FileInput from './FileInput';
import LoadingButton from './LoadingButton';
import ProgressBar from './ProgressBar';
import { runTask } from '../utils/workerClient';

const ExtractImagesWorker = () => {
  const fileInputRef = useRef();
  const [images, setImages] = useState([]);
  const [ignoreSmask, setIgnoreSmask] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [progressMessage, setProgressMessage] = useState("");

  // Clean up old URLs when unmounting or resetting images
  useEffect(() => {
    return () => {
      images.forEach(({ url }) => URL.revokeObjectURL(url));
    };
  }, [images]);

  const handleExtractImages = async () => {
    if (!fileInputRef.current) return;

    const { file } = fileInputRef.current.getFilesWithPageRanges()[0];
    const buffer = await file.arrayBuffer();

    // Clean up previous URLs
    images.forEach(({ url }) => URL.revokeObjectURL(url));
    setImages([]);
    setLoading(true);
    const pageRange = fileInputRef.current.getFilesWithPageRanges()[0].pageRange;
    runTask('extractImages', { buffer, ignoreSmask, pageRange })
      .onPartial((data) => {
        console.log("Partial result:", data);
          const blob = new Blob([data.buffer], { type: data.mime });
          const url = URL.createObjectURL(blob);
          setImages((prev) => [...prev, { url, name: data.name }]);
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
      <div className='grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full'>
        {images.map(({ url, name }, idx) => (
          <div key={idx}>
            <a href={url} download={name} target="_blank" rel="noopener noreferrer">
              <img
                src={url}
                alt={name}
                style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
              />
              <p className='text-sm truncate'>{name}</p>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExtractImagesWorker;
