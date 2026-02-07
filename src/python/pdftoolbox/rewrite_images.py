import pymupdf
from .utils import fix_xref

def rewrite_images_pdf(buffer, dpi_threshold=None, dpi_target=0, quality=0, 
                       lossy=True, lossless=True, bitonal=True, color=True, 
                       gray=True, set_to_gray=False, reportProgress=None, **save_options):
    """
    Walk through all images and rewrite them according to the specified parameters.
    Useful for reducing file size, changing image formats, or converting color spaces.

    Args:
        buffer: PDF file content as bytes.
        dpi_threshold: If None (default) no resampling takes place. Otherwise images 
                      with a DPI value larger than this will be resampled to dpi_target.
        dpi_target: Target DPI value for resampled images (must be less than dpi_threshold).
        quality: Desired target JPEG quality, 0-100. 0 = no quality change, 100 = best.
        lossy: Include lossy image types (e.g., JPEG).
        lossless: Include lossless image types (e.g., PNG).
        bitonal: Include black-and-white images (e.g., FAX).
        color: Include colored images.
        gray: Include grayscale images.
        set_to_gray: If True, convert entire PDF to grayscale before processing images.
        reportProgress: Optional callback function for progress reporting.
        **save_options: PDF save options (garbage, clean, deflate, deflate_images, etc.)

    Returns:
        Rewritten PDF content as bytes.
    """

    doc = pymupdf.Document(stream=buffer)
    # fix_xref(doc)
    
    if reportProgress:
        reportProgress(10, "Preparing document...")
    
    if reportProgress:
        reportProgress(30, "Rewriting images...")

    # try:
    doc.rewrite_images(
        dpi_threshold=dpi_threshold,
        dpi_target=dpi_target,
        quality=quality,
        lossy=lossy,
        lossless=lossless,
        bitonal=bitonal,
        color=color,
        gray=gray,
        set_to_gray=set_to_gray
    )

    if reportProgress:
        reportProgress(90, "Saving document...")
    
    docBytes = doc.tobytes(**save_options)
    doc.close()
    
    if reportProgress:
        reportProgress(100, "Done")
    
    return docBytes
