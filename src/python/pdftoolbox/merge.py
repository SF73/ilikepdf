import pymupdf


def merge_pdfs(buffers, pageRanges, reportProgress=None, **save_options):
    """
    Merge multiple PDF files into a single PDF file.

    Args:
        buffers: List of PDF file contents as bytes.
        pageRanges: List of tuples, each containing the start and end page numbers for each PDF.
        reportProgress: Optional callback function for progress reporting.
        **save_options: PDF save options (garbage, clean, deflate, deflate_images, etc.)

    Returns:
        Merged PDF content as bytes.
    """
    merged_doc = pymupdf.Document()
    
    for i, (buffer, pageRange) in enumerate(zip(buffers, pageRanges)):
        doc = pymupdf.Document(stream=buffer)
        s = slice(*pageRange)
        merged_doc.insert_pdf(doc, from_page=s.start, to_page=s.stop)
        doc.close()
        if reportProgress:
            percent = round((i + 1) / len(buffers) * 100)
            reportProgress(percent, f"Merging PDF {i + 1} of {len(buffers)}...")
    
    docBytes = merged_doc.tobytes(**save_options)
    merged_doc.close()
    if reportProgress:
        reportProgress(100, f"Done")
    return docBytes