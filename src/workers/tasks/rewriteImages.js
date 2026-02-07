export const rewriteImages = async ({ pyodide, pdftoolbox, buffer, options, saveOptions, reportProgress }) => {
  const pdfBuffer = pyodide.toPy(buffer);
  
  const rewrittenBuffer = pdftoolbox.rewrite_images_pdf.callKwargs(
    pyodide.toPy(buffer),
    {
      reportProgress,
      ...(options || {}),
      ...(saveOptions || {})
    }
  );
  
  return {
    buffer: rewrittenBuffer.toJs().buffer,
    mime: 'application/pdf',
  };
};
