export async function compress({ id, pdftoolbox, pyodide, buffer, maxFactor, reportProgress, garbage = 0, clean = false, deflate = false, useObjStms = 0}) {
  // buffer: bytes,
  // factor_limit: float = 2.0,
  // garbage: int = 3,
  // clean: bool = True,
  // deflate: bool = True,
  // use_objstms: int = 1,
  // reportProgress: Any = None
  const compressedBuffer = pdftoolbox.downsample_images.callKwargs(pyodide.toPy(buffer), {factor_limit: maxFactor, garbage, clean, deflate, use_objstms: useObjStms, reportProgress});
  return {
    buffer: compressedBuffer.toJs().buffer,
    mime: 'application/pdf',
  };
}