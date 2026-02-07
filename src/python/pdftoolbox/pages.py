import pymupdf
from .utils import fix_xref, parse_slices

def compose(buffer, pages, convert_from_one_indexed=False, **save_options):
    """
    Create a new PDF with selected pages from the input PDF.
    
    Args:
        buffer: PDF file content as bytes
        pages: Page specification (comma-separated list or Python slices)
        convert_from_one_indexed: Whether to convert 1-indexed input to 0-indexed (default: False)
        **save_options: PDF save options (garbage, clean, deflate, deflate_images, etc.)
    
    Returns:
        New PDF content as bytes containing only selected pages
    """
    doc = pymupdf.Document(stream=buffer)
    # fix_xref(doc)
    
    pages = parse_slices(pages, count=doc.page_count, convert_from_one_indexed=convert_from_one_indexed)
    doc.select(pages)
    merged_buffer = doc.tobytes(**save_options)
    doc.close()
    return merged_buffer