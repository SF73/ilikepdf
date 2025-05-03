// Adapted from https://github.com/pymupdf/PyMuPDF/issues/4423#issuecomment-2773807348
// Should be removed when pymupdf 1.26.0 is released

export function fixXref(doc) {
    let badXref = 0;
    for (let xref = 1; xref < doc.xref_length(); xref++) {
            const o = doc.xref_object(xref);
            if (o === 'null') {
                badXref++;
                doc.update_object(xref, "<<>>");
            }
    }
    if (badXref > 0) {
        console.warn('Found ' + badXref + ' null xrefs in the document.');
    }
}