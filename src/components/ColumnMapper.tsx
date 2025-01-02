import React, { useState } from 'react';

interface ColumnMapperProps {
  headers: string[];
  onMap: (companyColumn: string) => void;
}

export const ColumnMapper: React.FC<ColumnMapperProps> = ({ headers, onMap }) => {
  const [selectedColumn, setSelectedColumn] = useState(
    headers.find(h => h.toLowerCase().includes('company')) || headers[0]
  );

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Map Company Column</h3>
      <div className="flex items-end space-x-4">
        <div className="flex-1">
          <label htmlFor="company-column" className="block text-sm font-medium text-gray-700 mb-1">
            Select Company Name Column
          </label>
          <select
            id="company-column"
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            {headers.map((header) => (
              <option key={header} value={header}>
                {header}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => onMap(selectedColumn)}
          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Process CSV
        </button>
      </div>
    </div>
  );
};