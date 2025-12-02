export interface SavedPdfRecord {
  id: string;
  filename: string;
  vin: string;
  purchaseDate: string;
  claimantName: string;
  docs: string[];
  createdAt: string;
  dataUrl: string;
}

const STORAGE_KEY = "carclame:savedPdfs";

const parseRecords = (raw: string | null): SavedPdfRecord[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => typeof item === "object" && item !== null);
    }
    return [];
  } catch (error) {
    console.warn("[pdfStorage] Failed to parse saved PDFs", error);
    return [];
  }
};

export const readSavedPdfs = (): SavedPdfRecord[] => {
  if (typeof window === "undefined") return [];
  return parseRecords(window.localStorage.getItem(STORAGE_KEY));
};

export const writeSavedPdfs = (records: SavedPdfRecord[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.warn("[pdfStorage] Failed to persist saved PDFs", error);
  }
};

export const clearSavedPdfs = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
};
