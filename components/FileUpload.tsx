import React, { useState, useRef } from 'react';
import { File, X, CheckCircle, AlertCircle, BarChart3, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';

interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

interface UploadedDataset {
  dataset_id: string;
  original_filename: string;
  file_size: number;
  file_type: string;
  row_count: number;
  column_count: number;
  numerical_columns: string[];
  categorical_columns: string[];
  created_at: string;
}

interface FileUploadProps {
  onFileUploaded?: (dataset: UploadedDataset) => void;
  onStartEDA?: (datasetId: string) => void;
  onStartML?: (datasetId: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileUploaded, 
  onStartEDA, 
  onStartML 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedDataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      return 'Please upload a CSV or Excel file (.csv, .xlsx)';
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      return 'File size must be less than 50MB';
    }
    
    return null;
  };

  const uploadFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress (replace with actual progress tracking in production)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('http://localhost:8000/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const result = await response.json();
      const dataset = result.data;
      
      setUploadedFile(dataset);
      onFileUploaded?.(dataset);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setUploadProgress(0);
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const clearUploadedFile = () => {
    setUploadedFile(null);
    setError(null);
    setUploadProgress(0);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Dataset
          </CardTitle>
          <CardDescription>
            Upload your CSV or Excel file to begin data analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
              ${isUploading ? 'opacity-50 pointer-events-none' : 'hover:border-gray-400'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {!isUploading ? (
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 text-gray-400">
                  <File className="w-full h-full" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Drag and drop your file here
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    or click to browse
                  </p>
                </div>
                <Button onClick={handleButtonClick} variant="outline">
                  Choose File
                </Button>
                <p className="text-xs text-gray-500">
                  Supports CSV and Excel files up to 50MB
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 text-blue-500">
                  <Upload className="w-full h-full animate-pulse" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Uploading...
                  </p>
                  <Progress value={uploadProgress} className="mt-2" />
                  <p className="text-sm text-gray-500 mt-1">
                    {uploadProgress}% complete
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Display */}
      {uploadedFile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Upload Successful
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  {uploadedFile.original_filename}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatFileSize(uploadedFile.file_size)} • {uploadedFile.file_type.toUpperCase()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearUploadedFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Dataset Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">Rows</p>
                <p className="text-lg font-semibold text-gray-900">
                  {uploadedFile.row_count.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Columns</p>
                <p className="text-lg font-semibold text-gray-900">
                  {uploadedFile.column_count}
                </p>
              </div>
            </div>

            {/* Column Types */}
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Numerical Columns ({uploadedFile.numerical_columns.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {uploadedFile.numerical_columns.slice(0, 5).map((col) => (
                    <Badge key={col} variant="secondary" className="text-xs">
                      {col}
                    </Badge>
                  ))}
                  {uploadedFile.numerical_columns.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{uploadedFile.numerical_columns.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Categorical Columns ({uploadedFile.categorical_columns.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {uploadedFile.categorical_columns.slice(0, 5).map((col) => (
                    <Badge key={col} variant="outline" className="text-xs">
                      {col}
                    </Badge>
                  ))}
                  {uploadedFile.categorical_columns.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{uploadedFile.categorical_columns.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => onStartEDA?.(uploadedFile.dataset_id)}
                className="flex-1"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Start EDA
              </Button>
              <Button
                onClick={() => onStartML?.(uploadedFile.dataset_id)}
                variant="outline"
                className="flex-1"
              >
                Start ML
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUpload;