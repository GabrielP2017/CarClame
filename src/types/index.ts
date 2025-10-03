export interface Accident {
  type: string;
  date: string;
  payout: number;
}

export interface KahistoryData {
  vin: string;
  accidents: Accident[];
  specialUse: boolean;
  theft: boolean;
  writtenOff: boolean;
}

export interface OCRData {
  noAccidentMarked: boolean;
  categories: {
    engine: string;
    mission: string;
    steering: string;
    brake: string;
    electric: string;
  };
}

export interface FormData {
  vin: string;
  purchaseDate: string;
  mileage: number;
  channel: string;
  docImages?: FileList;
  riders?: string;
  inspectPhotos?: FileList;
  repairPdf?: File;
}

export interface DiagnosisResult {
  kahistory: KahistoryData;
  ocr: OCRData;
  photoFindings: string[];
  flags: string[];
}
