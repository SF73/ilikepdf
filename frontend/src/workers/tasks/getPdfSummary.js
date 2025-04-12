export async function getPdfSummary({ pyodide, pymupdf, buffer, dpi = 10, alpha = false}) {
    const doc = pymupdf.Document.callKwargs({
      stream: pyodide.toPy(new Uint8Array(buffer))
    });
  
    const pageCount = doc.page_count;
  
    const page = doc.load_page(0);
    const pixmap = page.get_pixmap.callKwargs({ dpi: dpi, alpha: alpha });
    const imageBuffer = pixmap.tobytes().toJs();
    doc.close();
  
    return {
      pageCount,
      buffer: imageBuffer.buffer,
      mime: "image/png"
    };
  }
  