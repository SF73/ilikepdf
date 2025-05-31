import zlib
from typing import Dict, Any

import pymupdf


def get_image_info(doc, reportProgress = None) -> Dict[int, Dict[str, Any]]:
    """
    Extract and organize image usage information from a PDF document.
    """
    image_usage = {}

    for page_index, page in enumerate(doc):
        if reportProgress:
            reportProgress(0, f"Analyzing page {page_index + 1}/{len(doc)}") 
        for img in page.get_images(full=True):
            xref = img[0]
            bbox_list = page.get_image_rects(img)

            if xref not in image_usage:
                image_usage[xref] = {
                    "xref": xref,
                    "display_width": 0,
                    "display_height": 0,
                    "pages": set(),
                    "width": img[2],
                    "height": img[3],
                    "smask": img[1],
                    "bpc": img[4],
                    "colorspace": img[5],
                    "name": img[7],
                    "filter": img[8],
                }

            for bbox in bbox_list:
                image_usage[xref]["display_width"] = max(image_usage[xref]["display_width"], bbox.width)
                image_usage[xref]["display_height"] = max(image_usage[xref]["display_height"], bbox.height)
                image_usage[xref]["pages"].add(page_index)

            display_width = image_usage[xref]["display_width"]
            image_usage[xref]["ratio"] = (
                image_usage[xref]["width"] / display_width if display_width > 0 else 1
            )

    return image_usage


def downsample_images(
    buffer: bytes,
    factor_limit: float = 2.0,
    garbage: int = 3,
    clean: bool = True,
    deflate: bool = True,
    use_objstms: int = 1,
    reportProgress: Any = None
) -> bytes:
    """
    Compress images in a PDF if they exceed the specified display-to-actual size ratio.
    """

    doc = pymupdf.Document(stream=buffer)
    reportProgress(0, f"Searching images in document")
    image_info = get_image_info(doc, reportProgress)

    for index, (xref, info) in enumerate(image_info.items()):
        # Skip images that don’t meet the ratio threshold
        if info["ratio"] < factor_limit:
            continue

        pixmap = pymupdf.Pixmap(doc, xref)
        new_width = round(info["display_width"] * factor_limit)
        new_height = round(info["display_height"] * factor_limit)

        scaled_pixmap = pymupdf.Pixmap(pixmap, new_width, new_height)
        raw_bytes = scaled_pixmap.samples

        compressed_bytes = zlib.compress(raw_bytes, level=9)
        use_compressed = len(compressed_bytes) < len(raw_bytes)

        # Only replace if compressed image is smaller than original
        old_length = int(doc.xref_get_key(xref, "Length")[1])
        final_bytes = compressed_bytes if use_compressed else raw_bytes

        if len(final_bytes) < old_length:
            doc.update_stream(xref, final_bytes, compress=False)
            doc.xref_set_key(xref, "Width", str(scaled_pixmap.width))
            doc.xref_set_key(xref, "Height", str(scaled_pixmap.height))
            if use_compressed:
                doc.xref_set_key(xref, "Filter", "/FlateDecode")
        if reportProgress:
            reportProgress((index + 1) / len(image_info) * 100, f"Compressing image {index + 1}/{len(image_info)}")
    
    if reportProgress:
        reportProgress(99, f"Cleaning up document")
    print(garbage, deflate, use_objstms, clean)
    docBytes =  doc.tobytes(deflate=deflate, garbage=garbage, use_objstms=use_objstms, clean=clean)
    doc.close()
    reportProgress(100, f"Done")
    return docBytes