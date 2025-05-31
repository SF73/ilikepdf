def fix_xref(doc):
    """
    Fix the cross-reference table of a PDF document.

    Args:
        doc (pymupdf.Document): The PDF document to fix.
    """
    for xref in range(1, doc.xref_length()):
        try:
            o = doc.xref_object(xref)
            if o == 'null':
                raise ValueError(f"Object {xref} is null")
        except:
            print(f"Found bad object {xref}")
            doc.update_object(xref, "<<>>")