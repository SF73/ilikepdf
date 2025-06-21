export async function extractImages({ id, pdftoolbox, pyodide, buffer, ignoreSmask = false, pageRange, reportProgress }) {
  function sendPartial(buffer, mime, name) {
    const image = {
      buffer: buffer.toJs().buffer,
      mime,
      name
    };
    self.postMessage({ id, status: "partial", data: image }, [image.buffer]);
  }
  // in python the page range is 1-indexed and end is excluded
  pdftoolbox.extract_images.callKwargs(pyodide.toPy(buffer), [pageRange?.start -1, pageRange?.end], reportProgress, sendPartial, {ignoreSmask});
  self.postMessage({ id, status: "done" });
}