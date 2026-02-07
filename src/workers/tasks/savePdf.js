export const savePdf = async ({ pyodide, pdftoolbox, buffer, reportProgress, saveOptions }) => {
  const pdfBuffer = pyodide.toPy(buffer);
  
  const savedBuffer = pdftoolbox.save_pdf.callKwargs(
    pdfBuffer,
    {
      reportProgress,
      ...(saveOptions || {})
    }
  );
  
  return {
    buffer: savedBuffer.toJs().buffer,
    mime: 'application/pdf',
  };
};
