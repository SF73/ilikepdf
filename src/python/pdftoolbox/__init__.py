from .metadata import get_metadata, set_metadata
from .extract import extract_images
from .compress import downsample_images
from .merge import merge_pdfs
from .pages import compose
import os
import pymupdf

version = "0.1.0"

def header():
    message = f"This is PDFToolbox version {version}\n"
    message += f"Running in {os.name} environment\n"
    message += f"Python version: {os.sys.version}\n"
    message += f"PyMuPDF version: {pymupdf.__version__}\n" 
    return message