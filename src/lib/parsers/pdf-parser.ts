import pdfParse from "@cedrugs/pdf-parse";

export interface PDFParseResult {
  text: string;
  numPages: number;
}

export async function parsePDF(buffer: Buffer): Promise<PDFParseResult> {
  const pdfData = await pdfParse(buffer);
  
  const text = (pdfData.text || "")
    .replace(/[\r\n]+/g, "\n")
    .trim();

  if (!text || text.length < 10) {
    throw new Error("PDF appears empty or contains only images");
  }

  return {
    text,
    numPages: pdfData.numpages || 1
  };
}
