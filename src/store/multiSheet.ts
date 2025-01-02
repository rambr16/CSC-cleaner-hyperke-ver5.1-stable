import { create } from 'zustand';
import { MultiSheetState, SheetProcessingStatus } from '../types';

const EXPIRY_TIME = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

export const useMultiSheetStore = create<MultiSheetState>((set, get) => ({
  sheets: new Map(),
  
  addSheet: (sheetName, status) => {
    set((state) => {
      const newSheets = new Map(state.sheets);
      newSheets.set(sheetName, status);
      return { sheets: newSheets };
    });
  },
  
  updateSheet: (sheetName, status) => {
    set((state) => {
      const newSheets = new Map(state.sheets);
      const currentStatus = newSheets.get(sheetName);
      if (currentStatus) {
        newSheets.set(sheetName, { ...currentStatus, ...status });
      }
      return { sheets: newSheets };
    });
  },
  
  removeSheet: (sheetName) => {
    set((state) => {
      const newSheets = new Map(state.sheets);
      newSheets.delete(sheetName);
      return { sheets: newSheets };
    });
  },
  
  clearExpiredSheets: () => {
    set((state) => {
      const newSheets = new Map(state.sheets);
      const now = Date.now();
      
      for (const [sheetName, status] of newSheets.entries()) {
        const uploadTime = new Date(status.uploadTime).getTime();
        if (now - uploadTime > EXPIRY_TIME) {
          newSheets.delete(sheetName);
        }
      }
      
      return { sheets: newSheets };
    });
  },
}));