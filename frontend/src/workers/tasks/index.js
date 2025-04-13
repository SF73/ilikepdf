// import { extractImagesFromPdf } from "./extractImagesFromPdf.js";
import { getPdfMetadata } from "./getPdfMetadata.js";
import { extractImages } from "./extractImages.js";
import { setPdfMetadata } from "./setPdfMetadata.js";
import { selectPages } from "./selectPages.js";
import { getPdfSummary } from "./getPdfSummary.js";
import { mergePdfs } from "./mergePdf.js";

export const tasks = {
  extractImages,
  getPdfMetadata,
  setPdfMetadata,
  selectPages,
  getPdfSummary,
  mergePdfs,
};
