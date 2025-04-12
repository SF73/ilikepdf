export async function extractImages({ id, pymupdf, pyodide, buffer, ignoreSmask = false, reportProgress }) {
    const doc = pymupdf.Document.callKwargs({ stream: pyodide.toPy(buffer) });
  
    const processedXrefs = new Set();
    const pageCount = doc.page_count;
  
    for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
      const page = doc.load_page(pageIndex);
      const imageList = page.get_images({ full: true }).toJs();
  
      for (const [xref, smask] of imageList) {
        if (processedXrefs.has(xref)) continue;
        processedXrefs.add(xref);
  
        let image;
        if (ignoreSmask || smask === 0) {
          const imgDict = doc.extract_image(xref).toJs({ dict_converter: Object.fromEntries });
          if (!imgDict) continue;
          image = {
            buffer: imgDict.image.buffer,
            mime: `image/${imgDict.ext || "png"}`,
            name: `page_${pageIndex + 1}_img_${xref}.${imgDict.ext || "png"}`
          };
        } else {
          const pixmap = pymupdf.Pixmap(doc, xref);
          const maskPixmap = pymupdf.Pixmap(doc, smask);
          const combinedPixmap = pymupdf.Pixmap(pixmap, maskPixmap);
          const combinedBuffer = combinedPixmap.tobytes().toJs();
          image = {
            buffer: combinedBuffer.buffer,
            mime: "image/png",
            name: `page_${pageIndex + 1}_img_${xref}_combined.png`
          };
        }
  
        self.postMessage({ id, status: "partial", type: "image",   data: image }, [image.buffer]);
      }
  
      if (reportProgress) {
        reportProgress(Math.round(((pageIndex + 1) / pageCount) * 100), `Processed page ${pageIndex + 1}`);
      }
    }
  
    doc.close();
    self.postMessage({ id, status: "done" });
  }
  