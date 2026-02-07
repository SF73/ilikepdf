import pymupdf
from .utils import fix_xref
def get_metadata(buffer):
    
    """
    Extract metadata from a PDF file.

    Args:
        buffer (bytes): The PDF file content as bytes.

    Returns:
        dict: A dictionary containing the metadata of the PDF.
    """
    doc = pymupdf.Document(stream=buffer)
    metadata = doc.metadata
    doc.close()
    return metadata

def set_metadata(buffer, metadata):
    """
    Set metadata for a PDF file.

    Args:
        buffer (bytes): The PDF file content as bytes.
        metadata (dict): A dictionary containing the metadata to set.

    Returns:
        bytes: The PDF file content with updated metadata.
    """
    doc = pymupdf.Document(stream=buffer)
    # fix_xref(doc)
    doc.set_metadata(metadata)
    updated_buffer = doc.write()
    doc.close()
    return updated_buffer

def get_object_sizes(buffer, reportProgress):
    doc = pymupdf.Document(stream=buffer)

    def get_name(xref, key):
        try:
            v = doc.xref_get_key(xref, key)[1]
        except Exception:
            return None
        if not v or v == "null":
            return None
        s = str(v).strip()
        return s[1:] if s.startswith("/") else s

    objects = []
    total = 0

    try:
        xref_len = doc.xref_length()
        total_xrefs = max(0, xref_len - 1)

        # throttle progress calls (avoid spamming)
        step = max(1, total_xrefs // 100)  # ~1% increments

        for i, xref in enumerate(range(1, xref_len)):
            try:
                if doc.is_stream(xref):
                    size = len(doc.xref_stream_raw(xref))
                    subtype = get_name(xref, "Subtype")  # e.g. Image
                    objtype = f"stream:{subtype}" if subtype else "stream"
                else:
                    s = doc.xref_object(xref)
                    if s == "null":
                        size = 0
                        objtype = "null"
                    else:
                        size = len(s)
                        objtype = "object"

                objects.append({"xref": xref, "type": objtype, "size": size})
                total += size
            except Exception:
                # ignore weird/broken xrefs
                pass

            if reportProgress and (i % step == 0 or i == total_xrefs - 1):
                pct = (i + 1) / total_xrefs * 100 if total_xrefs else 100
                reportProgress(pct, f"Scanning object {i + 1}/{total_xrefs}")

        if reportProgress:
            reportProgress(100, "Done")

        return {"totalSize": total, "objects": objects}

    finally:
        doc.close()
