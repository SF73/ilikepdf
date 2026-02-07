export const mergePdfs = async ({ pyodide, pdftoolbox, buffers, pageRanges, reportProgress, saveOptions }) => {
  const pdfBuffers = buffers.map(b => pyodide.toPy(b));
  const ranges = pageRanges.map(r => [r?.start - 1, r?.end - 1]);
  console.log(pdfBuffers, ranges);
  
  const mergedBuffer = pdftoolbox.merge_pdfs.callKwargs(
    pdfBuffers,
    ranges,
    {
      reportProgress,
      ...(saveOptions || {})
    }
  );
  
  return {
    buffer: mergedBuffer.toJs().buffer,
    mime: 'application/pdf',
  };
};