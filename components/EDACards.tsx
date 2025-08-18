import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { BarChart3, Database, AlertTriangle, TrendingUp } from "lucide-react";
import { useState } from "react";


interface EDACardsProps {
  uploadedFile: File | null;
  selectedTarget: string;
}

export function EDACards({ uploadedFile, selectedTarget }: EDACardsProps) {
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportResult, setReportResult] = useState<any>(null);

  const summaryData = {
    rows: 1250,
    columns: 12,
    missingValues: 23,
    numericColumns: 8,
    categoricalColumns: 4,
    correlations: 0.73
  };

  const handleFullEdaReport = async () => {
    if (!uploadedFile || !selectedTarget) return;
    setReportLoading(true);
    setReportError(null);
    setReportResult(null);
    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("target_column", selectedTarget);
      const response = await fetch("http://localhost:8000/api/v1/eda/full_report/", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to generate full EDA report");
      const data = await response.json();
      setReportResult(data);
    } catch (err: any) {
      setReportError(err.message || "Unknown error");
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
          Dataset <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">Overview</span>
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Get instant insights about your uploaded dataset with comprehensive statistical analysis
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-16">
        {/* Dataset Shape */}
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-200 hover:scale-105">
          <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-500"></div>
          <CardHeader className="pb-4 pt-8 px-8">
            <CardTitle className="flex items-center text-xl">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mr-4 shadow-md bg-blue-400">
                <Database className="h-6 w-6 text-white" />
              </div>
              <span className="text-gray-900">Dataset Shape</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="text-3xl font-bold mb-2 text-gray-900">
              {summaryData.rows.toLocaleString()} × {summaryData.columns}
            </div>
            <p className="text-gray-600 font-medium">Rows × Columns</p>
          </CardContent>
        </Card>

        {/* Missing Values */}
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-200 hover:scale-105">
          <div className="h-2 bg-gradient-to-r from-yellow-400 to-orange-400"></div>
          <CardHeader className="pb-4 pt-8 px-8">
            <CardTitle className="flex items-center text-xl">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mr-4 shadow-md bg-gradient-to-r from-yellow-400 to-orange-400">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <span className="text-gray-900">Missing Values</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="text-3xl font-bold mb-2 text-gray-900">
              {summaryData.missingValues}
            </div>
            <p className="text-gray-600 font-medium">
              {((summaryData.missingValues / (summaryData.rows * summaryData.columns)) * 100).toFixed(1)}% of total data
            </p>
          </CardContent>
        </Card>

        {/* Data Types */}
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-200 hover:scale-105">
          <div className="h-2 bg-gradient-to-r from-green-400 to-green-500"></div>
          <CardHeader className="pb-4 pt-8 px-8">
            <CardTitle className="flex items-center text-xl">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mr-4 shadow-md bg-green-400">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <span className="text-gray-900">Data Types</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Badge className="px-4 py-2 text-sm font-medium rounded-lg shadow-sm bg-blue-400 text-white hover:bg-blue-400">
                  Numeric
                </Badge>
                <span className="text-lg font-semibold text-gray-900">{summaryData.numericColumns}</span>
              </div>
              <div className="flex justify-between items-center">
                <Badge className="px-4 py-2 text-sm font-medium rounded-lg shadow-sm bg-green-400 text-white hover:bg-green-400">
                  Categorical
                </Badge>
                <span className="text-lg font-semibold text-gray-900">{summaryData.categoricalColumns}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Correlation */}
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-200 hover:scale-105">
          <div className="h-2 bg-gradient-to-r from-purple-400 to-pink-400"></div>
          <CardHeader className="pb-4 pt-8 px-8">
            <CardTitle className="flex items-center text-xl">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mr-4 shadow-md bg-gradient-to-r from-purple-400 to-pink-400">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-gray-900">Max Correlation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="text-3xl font-bold mb-2 text-gray-900">
              {summaryData.correlations}
            </div>
            <p className="text-gray-600 font-medium">Strongest feature relationship</p>
          </CardContent>
        </Card>
      </div>

      {/* Correlation Heatmap Preview */}
      <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="px-10 py-8 bg-gradient-to-r from-gray-50 to-blue-50">
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-4 shadow-md bg-blue-400">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            Correlation Heatmap Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-10">
          <div className="w-full h-80 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300 transition-all duration-200 hover:border-blue-400 bg-gradient-to-br from-blue-50/20 to-green-50/20">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg bg-gradient-to-br from-blue-400 to-green-400">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <p className="text-xl font-semibold text-gray-700 mb-3">Interactive correlation heatmap will appear here</p>
              <p className="text-lg text-gray-500">Click "Generate Full EDA Report" to view detailed analysis</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 text-center">
        <button
          className="px-8 py-4 rounded-xl shadow-lg bg-gradient-to-r from-blue-400 to-green-400 text-white text-lg font-semibold border-0 hover:scale-105 hover:shadow-xl"
          onClick={handleFullEdaReport}
          disabled={reportLoading || !uploadedFile || !selectedTarget}
        >
          {reportLoading ? "Generating..." : "Generate Full EDA Report"}
        </button>
        {reportError && <div className="text-red-700 mt-4">{reportError}</div>}
      </div>
      {reportResult && (
        <div className="mt-8 p-6 rounded-xl shadow bg-white">
          <h3 className="text-2xl font-bold mb-4 text-center text-blue-700">Full EDA Report</h3>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">{JSON.stringify(reportResult, null, 2)}</pre>
        </div>
      )}

      {/* Basic Info Display */}
      <div className="p-8 bg-white rounded-xl shadow-md max-w-3xl mx-auto mt-12">
        <h2 className="text-3xl font-bold mb-6 text-blue-700 text-center">EDA Report</h2>
        <div className="mb-4 text-lg text-gray-700">
          <strong>Uploaded File:</strong> {uploadedFile ? uploadedFile.name : "No file uploaded"}
        </div>
        <div className="mb-4 text-lg text-gray-700">
          <strong>Target Column:</strong> {selectedTarget || "Not selected"}
        </div>
        {/* TODO: Add EDA logic and visualizations here */}
      </div>
    </section>
  );
}