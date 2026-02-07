from .metadata import get_metadata, set_metadata, get_object_sizes
from .extract import extract_images
from .compress import downsample_images
from .merge import merge_pdfs
from .pages import compose
from .save import save_pdf
from .rewrite_images import rewrite_images_pdf

import os
import pymupdf

version = "0.1.0"

def header():
    message = f"This is PDFToolbox version {version}\n"
    message += f"Python version: {os.sys.version}\n"
    message += f"PyMuPDF version: {pymupdf.__version__}\n" 
    message += f"mupdf version: {pymupdf.mupdf_version}\n"
    return message