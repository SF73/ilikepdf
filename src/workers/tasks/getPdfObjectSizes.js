export async function getPdfObjectSizes({ id, pdftoolbox, pyodide, buffer, reportProgress }) {
  const res = pdftoolbox.get_object_sizes.callKwargs(
    pyodide.toPy(buffer),
    { reportProgress }
  );

  return res.toJs({ dict_converter: Object.fromEntries });
}
