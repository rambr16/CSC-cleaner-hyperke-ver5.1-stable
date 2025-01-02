import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import Papa from 'papaparse';
import { useProcessorStore } from '../store/processor';
import { useMultiSheetStore } from '../store/multiSheet';
import { PreviewTable } from './PreviewTable';
import { ColumnMapper } from './ColumnMapper';

export const FileUpload: React.FC = () => {
  const { setStatus, resetStatus } = useProcessorStore();
  const { addSheet, updateSheet } = useMultiSheetStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<any[] | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [showColumnMapping, setShowColumnMapping] = useState(false);
  
  const handleDownload = useCallback(() => {
    if (!processedData) return;
    
    const csv = Papa.unparse(processedData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'processed_data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [processedData]);
  
  const processFile = useCallback(async (file: File, companyColumn?: string) => {
    try {
      setCurrentFile(file);
      const sheetName = file.name;
      
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const totalRows = results.data.length;
          addSheet(sheetName, {
            sheetName,
            totalRows,
            processedRows: 0,
            progress: 0,
            stage: 'Starting processing...',
            isComplete: false,
            uploadTime: new Date().toISOString(),
            eta: 0
          });

          const worker = new Worker(
            new URL('../workers/csvProcessor.worker.ts', import.meta.url),
            { type: 'module' }
          );
          
          worker.onmessage = (e) => {
            if (e.data.type === 'progress') {
              updateSheet(sheetName, {
                progress: e.data.progress,
                stage: e.data.stage,
                processedRows: Math.floor((e.data.progress / 100) * totalRows)
              });
            } else if (e.data.type === 'complete') {
              const blob = new Blob([Papa.unparse(e.data.data)], { type: 'text/csv' });
              updateSheet(sheetName, {
                progress: 100,
                isComplete: true,
                stage: 'Processing complete',
                processedRows: totalRows,
                downloadUrl: URL.createObjectURL(blob)
              });
              setProcessedData(e.data.data);
              setIsProcessing(false);
              setShowColumnMapping(false);
              setCurrentFile(null);
            } else if (e.data.type === 'error') {
              updateSheet(sheetName, {
                error: e.data.error,
                isComplete: true,
                stage: 'Error occurred'
              });
              setIsProcessing(false);
            }
          };
          
          worker.postMessage({
            data: results.data,
            companyColumn: companyColumn || 'company'
          });
        },
        error: (error) => {
          setStatus({
            error: error.message,
            isComplete: true,
            stage: 'Error parsing CSV'
          });
          setIsProcessing(false);
        }
      });
    } catch (error) {
      setStatus({
        error: error instanceof Error ? error.message : 'An error occurred',
        isComplete: true,
        stage: 'Error occurred'
      });
      setIsProcessing(false);
    }
  }, [setStatus, addSheet, updateSheet]);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0 && !isProcessing) {
      const file = acceptedFiles[0];
      Papa.parse(file, {
        header: true,
        preview: 1,
        complete: (results) => {
          setHeaders(Object.keys(results.data[0]));
          setShowColumnMapping(true);
          setCurrentFile(file);
        }
      });
    }
  }, [isProcessing]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false,
    disabled: isProcessing
  });
  
  return (
    <>
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-lg text-gray-600">
          {isDragActive
            ? "Drop the CSV file here"
            : isProcessing
            ? "Processing file..."
            : "Drag & drop a CSV file here, or click to select"}
        </p>
      </div>
      
      {showColumnMapping && currentFile && (
        <ColumnMapper
          headers={headers}
          onMap={(companyColumn) => {
            processFile(currentFile, companyColumn);
            setShowColumnMapping(false);
          }}
        />
      )}
      
      {processedData && (
        <PreviewTable 
          data={processedData} 
          onDownload={handleDownload}
        />
      )}
    </>
  );
};