export const extractImagesFromPdf = async (pymupdf, pyodide, file, ignoreSmask) => {
  const buffer = await file.arrayBuffer();
  const doc = pymupdf.Document.callKwargs({ stream: pyodide.toPy(buffer) });

  const extractedImages = [];
  const processedXrefs = new Set();

  for (let pageIndex = 0; pageIndex < doc.page_count; pageIndex++) {
    const page = doc.load_page(pageIndex);
    const imageList = page.get_images({ full: true }).toJs();
    for (const img of imageList) {
      const xref = img[0];
      const smask = img[1];

      if (processedXrefs.has(xref)) continue;
      processedXrefs.add(xref);

      if (ignoreSmask || smask === 0) {
        const imgDict = doc.extract_image(xref).toJs({ dict_converter: Object.fromEntries });
        if (!imgDict) continue;
        const imageData = imgDict.image;
        const ext = imgDict.ext || 'png';

        const blob = new Blob([imageData], { type: `image/${ext}` });
        const url = URL.createObjectURL(blob);
        extractedImages.push({ url, name: `page_${pageIndex + 1}_img_${xref}.${ext}` });
      } else {
        const pixmap = pymupdf.Pixmap(doc, xref);
        const maskPixmap = pymupdf.Pixmap(doc, smask);
        const combinedPixmap = pymupdf.Pixmap(pixmap, maskPixmap);
        const combinedBuffer = combinedPixmap.tobytes();
        const combinedBlob = new Blob([combinedBuffer.toJs()], { type: `image/png` });
        const combinedUrl = URL.createObjectURL(combinedBlob);
        extractedImages.push({ url: combinedUrl, name: `page_${pageIndex + 1}_img_${xref}_combined.png` });
      }
    }
  }

  doc.close();
  return extractedImages;
};

export const mergePdfs = async (pymupdf, pyodide, filesWithRanges) => {
  const mergedDoc = pymupdf.Document();
  for (const { file, pageRange } of filesWithRanges) {
    const buffer = await file.arrayBuffer();
    const pdfDoc = pymupdf.Document.callKwargs({ stream: pyodide.toPy(buffer) });
    let [start, end] = pageRange;
    mergedDoc.insert_pdf.callKwargs(pdfDoc, { from_page: start, to_page: end });
    pdfDoc.close();
  }
  const mergedBuffer = mergedDoc.write();
  mergedDoc.close();
  return new Blob([mergedBuffer.toJs()], { type: 'application/pdf' });
};

export const getPdfMetadata = async (pymupdf, pyodide, file) => {
  const buffer = await file.arrayBuffer();
  const doc = pymupdf.Document.callKwargs({ stream: pyodide.toPy(buffer) });
  const metadata = doc.metadata.toJs({ dict_converter: Object.fromEntries });
  doc.close();
  return metadata;
};

export const setPdfMetadata = async (pymupdf, pyodide, file, newMetadata) => {
  const buffer = await file.arrayBuffer();
  const doc = pymupdf.Document.callKwargs({ stream: pyodide.toPy(buffer) });
  doc.set_metadata(pyodide.toPy(newMetadata));
  const updatedBuffer = doc.write();
  doc.close();
  return new Blob([updatedBuffer.toJs()], { type: 'application/pdf' });
};

export const splitPdf = async (pymupdf, pyodide, file, splits) => {
  const buffer = await file.arrayBuffer();
  const doc = pymupdf.Document.callKwargs({ stream: pyodide.toPy(buffer) });
  const splitBlobs = [];

  splits.forEach(([start, end]) => {
    const newDoc = pymupdf.Document();
    newDoc.insert_pdf.callKwargs(doc, { from_page: start, to_page: end });
    const splitBuffer = newDoc.write();
    newDoc.close();
    const splitBlob = new Blob([splitBuffer.toJs()], { type: "application/pdf" });
    splitBlobs.push(splitBlob);
  });

  doc.close();
  return splitBlobs;
};
