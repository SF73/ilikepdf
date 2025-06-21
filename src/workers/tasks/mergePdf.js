export const mergePdfs = async ({ pyodide, pdftoolbox, buffers, pageRanges, reportProgress, garbage = 0, clean = false, deflate = false, useObjStms = 0 }) => {
    const pdfBuffers = buffers.map(b => pyodide.toPy(b));
    const ranges = pageRanges.map(r => [r?.start -1, r?.end -1]);
    console.log(pdfBuffers, ranges);
    const mergedBuffer = pdftoolbox.merge_pdfs.callKwargs(pdfBuffers, ranges, {garbage, clean, deflate, use_objstms: useObjStms, reportProgress});
    return {
        buffer: mergedBuffer.toJs().buffer,
        mime: 'application/pdf',
      };
};