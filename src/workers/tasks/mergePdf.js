export const mergePdfs = async ({ pymupdf, pyodide, buffers, pageRanges }) => {
    console.log(buffers, pageRanges);
    const mergedDoc = pymupdf.Document();
    for (let i = 0; i < buffers.length; i++) {
        const buffer = buffers[i];
        let {start, end} = pageRanges[i] ? pageRanges[i] : [null, null];
        start = start != null ? start : -1;
        end = end != null ? end : -1;
        const pdfDoc = pymupdf.Document.callKwargs({ stream: pyodide.toPy(buffer) });
        mergedDoc.insert_pdf.callKwargs(pdfDoc, { from_page: start, to_page: end });
        pdfDoc.close();
    }
    const mergedBuffer = mergedDoc.write();
    mergedDoc.close();
    return {
        buffer: mergedBuffer.toJs().buffer,
        mime: 'application/pdf',
      };
};