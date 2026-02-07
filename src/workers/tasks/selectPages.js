export async function selectPages({ pdftoolbox, pyodide, buffer, inputPages, saveOptions }) {
  const newDocBuffer = pdftoolbox.compose.callKwargs(
    pyodide.toPy(buffer),
    inputPages,
    true,
    saveOptions || {}
  );

  return {
    buffer: newDocBuffer.toJs().buffer,
    mime: 'application/pdf',
  };
}
