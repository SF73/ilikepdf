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
    fix_xref(doc)
    doc.set_metadata(metadata)
    updated_buffer = doc.write()
    doc.close()
    return updated_buffer