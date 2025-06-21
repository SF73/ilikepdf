export async function selectPages({ pdftoolbox, pyodide, buffer, inputPages }) {

  const newDocBuffer = pdftoolbox.compose.callKwargs(pyodide.toPy(buffer), inputPages, true, {deflate:true, garbage:4, use_objstms:1, clean:true});

  return {
    buffer: newDocBuffer.toJs().buffer,
    mime: 'application/pdf',
  };
}
