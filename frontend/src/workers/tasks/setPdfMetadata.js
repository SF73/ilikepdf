export async function setPdfMetadata({ pymupdf, pyodide, buffer, newMetadata }) {
    const doc = pymupdf.Document.callKwargs({
      stream: pyodide.toPy(buffer)
    });
  
    doc.set_metadata(pyodide.toPy(newMetadata));
  
    const updatedBuffer = doc.write();
    doc.close();
  
    return {
      buffer: updatedBuffer.toJs().buffer,
      mime: 'application/pdf',
    };
  }
  