import React, { useRef, useState } from 'react';
import FileInput from './FileInput';
import { usePyodide } from './PyodideProvider';

const ExtractImages = () => {
  const fileInputRef = useRef();
  const { pyodide, mypkg } = usePyodide();
  const [images, setImages] = useState([]); // State to store extracted images
  const [ignoreSmask, setIgnoreSmask] = useState(false); // State to toggle ignoring soft masks

  const handleExtractImages = async () => {
    if (!mypkg) {
      console.warn("Package is still loading");
      return;
    }
    if (fileInputRef.current) {
      const { file } = fileInputRef.current.getFilesWithPageRanges()[0]; // Single file
      const buffer = await file.arrayBuffer();
      const doc = mypkg.Document.callKwargs({ stream: pyodide.toPy(buffer) });

      const extractedImages = [];
      const processedXrefs = new Set(); // Track processed xrefs to avoid duplicates

      for (let pageIndex = 0; pageIndex < doc.page_count; pageIndex++) {
        const page = doc.load_page(pageIndex);
        const imageList = page.get_images({ full: true }).toJs();
        for (const img of imageList) {
          const xref = img[0];
          const smask = img[1];

          // Skip already processed images
          if (processedXrefs.has(xref)) {
            console.log(`[INFO] Skipping xref ${xref} (already extracted)`);
            continue;
          }
          processedXrefs.add(xref);

          if (ignoreSmask || smask === 0) {
            // Extract image directly

            const imgDict = doc.extract_image(xref).toJs({ dict_converter: Object.fromEntries });
            if (!imgDict) continue;
            const imageData = imgDict.image;
            const ext = imgDict.ext || 'png';

            const blob = new Blob([imageData], { type: `image/${ext}` });
            const url = URL.createObjectURL(blob);
            extractedImages.push({ url, name: `page_${pageIndex + 1}_img_${xref}.${ext}` });
          } else {
            // Handle soft mask
            const pixmap = mypkg.Pixmap(doc, xref); // Create a Pixmap for the base image
            const maskPixmap = mypkg.Pixmap(doc, smask); // Create a Pixmap for the mask
        
            // Combine the base image and mask
            const combinedPixmap = mypkg.Pixmap(pixmap, maskPixmap);
            // // Convert the combined Pixmap to a Blob
            const combinedBuffer = combinedPixmap.tobytes(); // Write the combined Pixmap to a buffer
            const combinedBlob =  new Blob([combinedBuffer.toJs()], { type: `image/png` });

            const combinedUrl = URL.createObjectURL(combinedBlob);
            extractedImages.push({ url: combinedUrl, name: `page_${pageIndex + 1}_img_${xref}_combined.png` });
          }
        }
      }

      doc.close();

      // Release previous image URLs
      images.forEach(({ url }) => URL.revokeObjectURL(url));
      setImages(extractedImages); // Store new image URLs
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
      <button onClick={handleExtractImages}>Extract Images</button>
        <div className='grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full'>
          {images.map(({ url, name }, idx) => (
            <div key={idx} className='w-full'>
              <a href={url} download={name} target="_blank" rel="noopener noreferrer">
                <img src={url} alt={name} />
                {name}
              </a>
            </div>
          ))}
        </div>
      </div>
  );
};

export default ExtractImages;