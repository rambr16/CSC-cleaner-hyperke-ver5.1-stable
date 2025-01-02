// Add these new types to the existing types
export interface SheetProcessingStatus extends ProcessingStatus {
  sheetName: string;
  totalRows: number;
  processedRows: number;
  uploadTime: string;
  downloadUrl?: string;
}

export interface MultiSheetState {
  sheets: Map<string, SheetProcessingStatus>;
  addSheet: (sheetName: string, status: SheetProcessingStatus) => void;
  updateSheet: (sheetName: string, status: Partial<SheetProcessingStatus>) => void;
  removeSheet: (sheetName: string) => void;
  clearExpiredSheets: () => void;
}