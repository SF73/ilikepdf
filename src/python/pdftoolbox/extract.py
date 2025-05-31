import pymupdf

def extract_images(buffer, pageRange, reportProgress, sendPartial, ignoreSmask = False):
    """
    Extract images from a PDF file.

    Args:
        buffer (bytes): The PDF file content as bytes.
        pageRange (list): List of page numbers to extract images from.
        reportProgress (function): function to report progress.
        ignoreSmask (bool): Whether to ignore SMask images.

    """
    doc = pymupdf.Document(stream=buffer)
    processed_images = set()
    s = slice(*pageRange)
    for page in doc[s]:
        imageList = page.get_images(full= True)
        for img in imageList:
            xref = img[0]
            smask = img[1]
            if xref in processed_images:
                continue
            
            if smask == 0 or ignoreSmask:
                image_dict = doc.extract_image(xref)
                image = {
                    "buffer": image_dict["image"],
                    "mime": f"image/{image_dict.get('ext', 'png')}",
                    "name": f"page_{page.number + 1}_image_{xref}.{image_dict.get('ext', 'png')}",
                }
            else:
                pixmap = pymupdf.Pixmap(doc, xref)
                maskPixmap = pymupdf.Pixmap(doc, smask)
                combinedPixmap = pymupdf.Pixmap(pixmap, maskPixmap)
                combinedBuffer = combinedPixmap.tobytes()
                image = {
                    "buffer": combinedBuffer,
                    "mime": "image/png",
                    "name": f"page_{page.number + 1}_image_{xref}_combined.png",
                }
            
            processed_images.add(xref)

            sendPartial(image["buffer"], image["mime"], image["name"])

            if reportProgress:
                percent = round((page.number + 1 ) / doc.page_count *100)
                reportProgress(percent, f"Extracting images from page {page.number + 1}...")
    reportProgress(100, "Image extraction completed.")
    doc.close()