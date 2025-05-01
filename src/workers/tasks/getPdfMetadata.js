export function getPdfMetadata({ pyodide, pymupdf, buffer }) {
    const doc = pymupdf.Document.callKwargs({ stream: pyodide.toPy(buffer) });
    const metadata = doc.metadata.toJs({ dict_converter: Object.fromEntries });
    doc.close();
    return metadata;
  }
  