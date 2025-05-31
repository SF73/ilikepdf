export async function setPdfMetadata({ pyodide, pdftoolbox, buffer, newMetadata }) {
    const updatedBuffer = pdftoolbox.set_metadata(
      pyodide.toPy(buffer),
      pyodide.toPy(newMetadata));
    return {
      buffer: updatedBuffer.toJs().buffer,
      mime: 'application/pdf',
    };
  }
  