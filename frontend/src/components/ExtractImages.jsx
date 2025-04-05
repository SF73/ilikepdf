import React, { useRef, useState, useEffect } from 'react';
import FileInput from './FileInput';
import { usePyodide } from './PyodideProvider';
import LoadingButton from './LoadingButton';
import { extractImagesFromPdf } from '../utils/pymupdfUtils';

const ExtractImages = () => {
  const fileInputRef = useRef();
  const { pyodide, loading, pymupdf } = usePyodide();
  const [images, setImages] = useState([]);
  const [ignoreSmask, setIgnoreSmask] = useState(false);

  useEffect(() => {
    return () => {
      images.forEach(({ url }) => URL.revokeObjectURL(url));
    };
  }, [images]);
  
  const handleExtractImages = async () => {
    if (!pymupdf) {
      console.warn("Package is still loading");
      return;
    }
    if (fileInputRef.current) {
      const { file } = fileInputRef.current.getFilesWithPageRanges()[0];
      const extractedImages = await extractImagesFromPdf(pymupdf, pyodide, file, ignoreSmask);

      // Release previous image URLs
      images.forEach(({ url }) => URL.revokeObjectURL(url));
      setImages(extractedImages);
    }
  };

  return (
    <div>
      <FileInput ref={fileInputRef} enablePageRange={false} acceptedFileTypes="application/pdf" allowMultiple={false} />
      <label className='block'>
        <input
          type="checkbox"
          checked={ignoreSmask}
          onChange={(e) => setIgnoreSmask(e.target.checked)}
        />
        Ignore soft masks
      </label>
      <LoadingButton loading={loading} className='btn' onClick={handleExtractImages}>Extract Images</LoadingButton>
      <div className='grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full'>
        {images.map(({ url, name }, idx) => (
          <div key={idx}>
            <a href={url} download={name} target="_blank" rel="noopener noreferrer">
              <img src={url} alt={name} style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} />
              <p className='text-sm truncate'>{name}</p>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExtractImages;