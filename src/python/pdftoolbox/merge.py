import pymupdf


def merge_pdfs(buffers, pageRanges, reportProgress=None, garbage = 3, clean = True, deflate = True, use_objstms = 1):
    """
    Merge multiple PDF files into a single PDF file.

    Args:
        buffers (list): List of PDF file contents as bytes.
        pageRanges (list): List of tuples, each containing the start and end page numbers for each PDF.
        reportProgress (function, optional): Function to report progress.

    Returns:
        bytes: Merged PDF content as bytes.
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
    docBytes =  merged_doc.tobytes(deflate=deflate, garbage=garbage, use_objstms=use_objstms, clean=clean)
    merged_doc.close()
    if reportProgress:
        reportProgress(100, f"Done")
    return docBytes