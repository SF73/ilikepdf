export async function compress({ id, pdftoolbox, pyodide, buffer, maxFactor, reportProgress, saveOptions }) {
  const compressedBuffer = pdftoolbox.downsample_images.callKwargs(
    pyodide.toPy(buffer),
    {
      factor_limit: maxFactor,
      reportProgress,
      ...(saveOptions || {})
    }
  );
  
  return {
    buffer: compressedBuffer.toJs().buffer,
    mime: 'application/pdf',
  };
}