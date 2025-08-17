import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Upload, FileSpreadsheet, File, UploadCloud } from "lucide-react";
import { MLSection } from "./MLSection";

export function FileUpload({
  uploadedFile,
  setUploadedFile,
  selectedTarget,
  setSelectedTarget,
}: {
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  selectedTarget: string;
  setSelectedTarget: (target: string) => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [columns, setColumns] = useState<string[]>([]);
  const [edaLoading, setEdaLoading] = useState(false);
  const [edaError, setEdaError] = useState<string | null>(null);
  const [edaResult, setEdaResult] = useState<any>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  const handleUploadAnalyze = async () => {
    if (!uploadedFile) return;
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    setColumns([]);
    setEdaResult(null);
    const formData = new FormData();
    formData.append("file", uploadedFile);
    try {
      const response = await fetch("http://localhost:8000/upload/", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      setColumns(data.columns || []);
      setUploadSuccess(true);
    } catch (err: any) {
      setUploadError(err.message || "Unknown error");
    } finally {
      setUploading(false);
    }
  };

  const handleEdaRequest = async () => {
    if (!selectedTarget) return;
    setEdaLoading(true);
    setEdaError(null);
    setEdaResult(null);
    try {
      const response = await fetch(`http://localhost:8000/eda/?target_column=${encodeURIComponent(selectedTarget)}`);
      if (!response.ok) throw new Error("EDA request failed");
      const data = await response.json();
      setEdaResult(data);
    } catch (err: any) {
      setEdaError(err.message || "Unknown error");
    } finally {
      setEdaLoading(false);
    }
  };

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="text-center mb-16">
        <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
          Welcome to <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">SmartEDA</span>
        </h1>
        <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
          Upload your dataset and get instant exploratory data analysis with powerful visualizations and machine learning insights.
        </p>
      </div>

      <Card className="max-w-5xl mx-auto border-0 shadow-xl rounded-2xl overflow-hidden">
        <div
          className={`p-16 lg:p-20 border-2 border-dashed rounded-2xl transition-all duration-300 ${
            isDragOver
              ? "border-blue-400 bg-gradient-to-br from-blue-50 to-green-50 scale-[1.02]"
              : "border-gray-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-green-50/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 shadow-lg bg-gradient-to-br from-blue-400 to-green-400">
                <UploadCloud className="h-12 w-12 text-white" />
              </div>
            </div>
            
            {uploadedFile ? (
              <div className="mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mr-4 shadow-md bg-green-400">
                    <FileSpreadsheet className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="text-2xl font-semibold text-gray-900 block">{uploadedFile.name}</span>
                    <p className="text-lg text-gray-500 mt-1">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8">
                <h3 className="text-3xl lg:text-4xl font-semibold text-gray-900 mb-4">
                  Drag & drop your dataset here
                </h3>
                <p className="text-xl text-gray-600 mb-2">or click to browse your files</p>
                <p className="text-lg text-gray-500">Supports CSV, Excel, and other data formats</p>
              </div>
            )}

            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button 
                className="text-lg font-semibold px-12 py-4 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 bg-gradient-to-r from-blue-400 to-green-400 text-white border-0" 
                asChild
              >
                <span className="cursor-pointer">
                  {uploadedFile ? "Choose Different File" : "Browse Files"}
                </span>
              </Button>
            </label>

            <div className="flex items-center justify-center mt-12 space-x-12">
              <div className="flex items-center text-lg text-gray-600">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 shadow-sm bg-blue-400">
                  <File className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium">CSV Files</span>
              </div>
              <div className="flex items-center text-lg text-gray-600">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 shadow-sm bg-green-400">
                  <FileSpreadsheet className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium">Excel Files</span>
              </div>
            </div>
          </div>
        </div>

        {uploadedFile && (
          <div className="mx-8 mb-8 p-6 rounded-xl shadow-md bg-gradient-to-r from-green-400 to-green-300">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-white rounded-full mr-4 shadow-sm"></div>
                  <span className="text-white font-semibold text-lg">File uploaded successfully! Ready for analysis.</span>
                </div>
                <Button 
                  className="font-semibold px-8 py-3 rounded-xl shadow-md bg-white text-gray-900 hover:bg-gray-50 transition-all duration-200 hover:shadow-lg hover:scale-105 border-0"
                  onClick={handleUploadAnalyze}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Upload & Analyze"}
                </Button>
              </div>
              {uploadError && <div className="text-red-700 mt-2">{uploadError}</div>}
              {uploadSuccess && <div className="text-green-700 mt-2">Upload successful!</div>}
              {/* Target column selector */}
              {columns.length > 0 && (
                <div className="mt-4">
                  <label htmlFor="target-select" className="block text-white font-semibold mb-2">Select Target Column for EDA/ML:</label>
                  <select
                    id="target-select"
                    value={selectedTarget}
                    onChange={e => setSelectedTarget(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">-- Select --</option>
                    {columns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                  <Button
                    className="mt-4 px-8 py-3 rounded-xl shadow-md bg-white text-gray-900 hover:bg-gray-50 border-0"
                    onClick={handleEdaRequest}
                    disabled={edaLoading || !selectedTarget}
                  >
                    {edaLoading ? "Analyzing..." : "Run EDA"}
                  </Button>
                  {edaError && <div className="text-red-700 mt-2">{edaError}</div>}
                </div>
              )}
              {/* EDA Results */}
              {edaResult && (
                <div className="mt-8 p-6 rounded-xl shadow bg-white">
                  <h3 className="text-2xl font-bold mb-4 text-center text-blue-700">EDA Results</h3>
                  <div className="mb-4">
                    <strong>Shape:</strong> {JSON.stringify(edaResult.shape)}<br />
                    <strong>Columns:</strong> {edaResult.columns.join(", ")}
                  </div>
                  <div className="mb-4">
                    <strong>Missing Values:</strong> {JSON.stringify(edaResult.missing)}
                  </div>
                  <div className="mb-4">
                    <strong>Class Balance:</strong> {edaResult.class_balance ? JSON.stringify(edaResult.class_balance) : "N/A"}
                  </div>
                  <div className="mb-4">
                    <strong>Grouped Stats:</strong> {edaResult.grouped_stats ? JSON.stringify(edaResult.grouped_stats) : "N/A"}
                  </div>
                  {/* Show sample preview */}
                  <div className="mb-4">
                    <strong>Sample Preview:</strong>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{JSON.stringify(edaResult.sample, null, 2)}</pre>
                  </div>
                  {/* Show base64 images */}
                  {edaResult.class_balance_plot && (
                    <div className="mb-4">
                      <strong>Class Balance Plot:</strong><br />
                      <img src={`data:image/png;base64,${edaResult.class_balance_plot}`} alt="Class Balance Plot" style={{maxWidth: '100%'}} />
                    </div>
                  )}
                  {edaResult.visualizations && Object.entries(edaResult.visualizations).map(([key, img]) => (
                    <div key={key} className="mb-4">
                      <strong>{key.replace(/_/g, ' ')}:</strong><br />
                      <img src={`data:image/png;base64,${img}`} alt={key} style={{maxWidth: '100%'}} />
                    </div>
                  ))}
                  {/* Generate Full EDA Report Button */}
                  <div className="mt-8 text-center">
                    <Button
                      className="px-8 py-4 rounded-xl shadow-lg bg-gradient-to-r from-blue-400 to-green-400 text-white text-lg font-semibold border-0 hover:scale-105 hover:shadow-xl"
                      onClick={() => {
                        // TODO: Implement full EDA report request logic
                        alert('Full EDA report generation coming soon!');
                      }}
                    >
                      Generate Full EDA Report
                    </Button>
                  </div>
                </div>
              )}
              {/* ML Section: Pass uploadedFile and selectedTarget as props */}
              {uploadedFile && selectedTarget && (
                <MLSection uploadedFile={uploadedFile} targetColumn={selectedTarget} />
              )}
            </div>
          </div>
        )}
      </Card>
    </section>
  );
}