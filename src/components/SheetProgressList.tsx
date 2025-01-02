import React, { useEffect } from 'react';
import { Download } from 'lucide-react';
import { useMultiSheetStore } from '../store/multiSheet';

export const SheetProgressList: React.FC = () => {
  const { sheets, clearExpiredSheets } = useMultiSheetStore();
  
  useEffect(() => {
    const interval = setInterval(clearExpiredSheets, 5 * 60 * 1000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, [clearExpiredSheets]);
  
  if (sheets.size === 0) return null;
  
  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-lg font-semibold">Processing Status</h3>
      {Array.from(sheets.entries()).map(([sheetName, status]) => (
        <div key={sheetName} className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">{sheetName}</span>
            <span className="text-sm text-gray-500">
              Uploaded: {new Date(status.uploadTime).toLocaleString()}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(status.processedRows / status.totalRows) * 100}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span>{status.stage}</span>
            <span>{status.processedRows} / {status.totalRows} rows</span>
          </div>
          
          {status.downloadUrl && (
            <button
              onClick={() => window.open(status.downloadUrl, '_blank')}
              className="mt-2 inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <Download className="h-4 w-4 mr-1" />
              Download Result
            </button>
          )}
        </div>
      ))}
    </div>
  );
}