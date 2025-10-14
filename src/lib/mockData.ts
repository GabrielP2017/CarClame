import { KahistoryData, OCRData } from "@/types";

export const MOCK_KAHISTORY: KahistoryData = {
  vin: "KMHXX123456789000",
  accidents: [
    { type: "침수", date: "2024-07-12", payout: 2300000 },
    { type: "단순수리", date: "2023-12-01", payout: 350000 },
  ],
  specialUse: false,
  theft: false,
  writtenOff: false,
};

export const MOCK_OCR: OCRData = {
  noAccidentMarked: true,
  categories: {
    engine: "정상",
    mission: "정상",
    steering: "정상",
    brake: "정상",
    electric: "점검요",
  },
};
