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

          const imgDict = doc.extract_image(xref).toJs({ dict_converter: Object.fromEntries });
          if (!imgDict) continue;
          console.log(imgDict);
          const imageData = imgDict.image;
          const ext = imgDict.ext || 'png';

          if (ignoreSmask || smask === 0) {
            // Extract image directly
            const blob = new Blob([imageData], { type: `image/${ext}` });
            const url = URL.createObjectURL(blob);
            extractedImages.push({ url, name: `page_${pageIndex + 1}_img_${xref}.${ext}` });
          } else {
            // Handle soft mask
            const maskDict = doc.extract_image(smask).toJs({ dict_converter: Object.fromEntries });
            if (!maskDict) continue;

            const maskData = maskDict.image;
            const combinedBlob = combineImageAndMask(imageData, maskData, ext);
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

  const combineImageAndMask = (imageData, maskData, ext) => {
    console.log(pyodide.toPy(imageData));
    console.log(maskData);
    const pixmap = new mypkg.Pixmap(pyodide.toPy(imageData)); // Create a Pixmap for the base image
    const maskPixmap = new mypkg.Pixmap(pyodide.toPy(maskData)); // Create a Pixmap for the mask

    console.log(pixmap.size); 
    console.log(maskPixmap.size);
    // Combine the base image and mask
    const combinedPixmap = new mypkg.Pixmap(pixmap, maskPixmap);
    console.log(combinedPixmap);
    // Convert the combined Pixmap to a Blob
    const combinedBuffer = combinedPixmap.tobytes.call(); // Write the combined Pixmap to a buffer
    console.log(combinedBuffer);
    return new Blob([combinedBuffer.toJs()], { type: `image/${ext}` });
  };

  return (
    <div>
      <FileInput ref={fileInputRef} enablePageRange={false} acceptedFileTypes="application/pdf" allowMultiple={false} />
      <label style={{ display: 'block', marginTop: '10px' }}>
        <input
          type="checkbox"
          checked={ignoreSmask}
          onChange={(e) => setIgnoreSmask(e.target.checked)}
        />
        Ignore soft masks
      </label>
      <button onClick={handleExtractImages} style={{ marginTop: '10px' }}>Extract Images</button>
      <div style={{ marginTop: '10px' }}>
        {images.map(({ url, name }, idx) => (
          <div key={idx} style={{ marginBottom: '10px' }}>
            <a href={url} download={name} target="_blank" rel="noopener noreferrer">
              <img src={url} alt={name} style={{ maxWidth: '200px', maxHeight: '200px', display: 'block' }} />
              {name}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExtractImages;