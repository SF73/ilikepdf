export const getPdfMetadata = async ({id, pdftoolbox, pyodide, buffer }) => {
    const metadata =  pdftoolbox.get_metadata(pyodide.toPy(buffer));
    return metadata.toJs({ dict_converter: Object.fromEntries });
}