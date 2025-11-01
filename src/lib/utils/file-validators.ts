export const FILE_CONSTRAINTS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPE: "application/pdf",
  ALLOWED_EXTENSION: ".pdf"
};

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export function validatePDFFile(file: File): FileValidationResult {
  if (file.type !== FILE_CONSTRAINTS.ALLOWED_TYPE) {
    return {
      isValid: false,
      error: "Please upload a valid PDF file"
    };
  }

  if (file.size > FILE_CONSTRAINTS.MAX_SIZE) {
    return {
      isValid: false,
      error: "File size must be less than 10MB"
    };
  }

  return { isValid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
