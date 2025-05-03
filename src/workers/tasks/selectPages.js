import { parsePageRanges } from './utils.js';
import { fixXref } from "../tmp";
export async function selectPages({ pymupdf, pyodide, buffer, slices }) {
  const doc = pymupdf.Document.callKwargs({
    stream: pyodide.toPy(buffer)
  });
  fixXref(doc);

  let pageSequence = parsePageRanges(slices, doc.page_count);

  // Convert 1-indexed pageSequence to 0-indexed for pymupdf
  pageSequence = pageSequence.map(page => page - 1);
  doc.select(pageSequence);
  const newDocBuffer = doc.tobytes.callKwargs({deflate:true, garbage:3, use_objstms:1, clean:true});
  doc.close();

  return {
    buffer: newDocBuffer.toJs().buffer,
    mime: 'application/pdf',
  };
}
