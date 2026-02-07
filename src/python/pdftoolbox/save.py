import pymupdf


def save_pdf(buffer, reportProgress=None, **save_options):
    """
    Save a PDF with custom save options.

    Args:
        buffer: PDF file content as bytes.
        reportProgress: Optional callback function for progress reporting.
        **save_options: PDF save options (garbage, clean, deflate, deflate_images, 
                       deflate_fonts, ascii, expand, linear, pretty, no_new_id, 
                       encryption, permissions, owner_pw, user_pw, use_objstms)

    Returns:
        Saved PDF content as bytes.
    """
    doc = pymupdf.Document(stream=buffer)
    
    if reportProgress:
        reportProgress(50, "Processing document...")
    
    docBytes = doc.tobytes(**save_options)
    doc.close()
    
    if reportProgress:
        reportProgress(100, "Done")
    
    return docBytes
