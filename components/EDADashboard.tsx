import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, PieChart, Activity, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import {
  AgeDistributionChart,
  SalaryExperienceChart,
  DepartmentDistributionChart,
  PerformanceDistributionChart,
  SalaryByAgeChart
} from './InteractiveCharts';

interface EDAResult {
  analysis_id: string;
  dataset_info: {
    filename: string;
    total_rows: number;
    total_columns: number;
    numerical_columns: string[];
    categorical_columns: string[];
    missing_values_summary: Record<string, number>;
  };
  statistical_summary: Record<string, any>;
  correlation_analysis: {
    high_correlations: Array<{
      column1: string;
      column2: string;
      correlation: number;
    }>;
    correlation_matrix_base64?: string;
  };
  outlier_detection: {
    outlier_summary: Record<string, number>;
    outlier_percentage: number;
  };
  visualizations: {
    distribution_plots?: string;
    correlation_heatmap?: string;
    missing_values_plot?: string;
    outlier_boxplots?: string;
  };
  processing_time: number;
  memory_used_mb: number;
}

interface EDADashboardProps {
  datasetId: string;
  onClose?: () => void;
}

const EDADashboard: React.FC<EDADashboardProps> = ({ datasetId, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [edaResult, setEdaResult] = useState<EDAResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Helper functions for generating chart data
  const generateAgeDistribution = () => {
    if (datasetId === 'demo-dataset-123' && (window as any).demoData) {
      const data = (window as any).demoData;
      const ageBins = { '20-29': 0, '30-39': 0, '40-49': 0, '50-59': 0, '60+': 0 };
      
      data.forEach((row: any) => {
        const age = row.age;
        if (age < 30) ageBins['20-29']++;
        else if (age < 40) ageBins['30-39']++;
        else if (age < 50) ageBins['40-49']++;
        else if (age < 60) ageBins['50-59']++;
        else ageBins['60+']++;
      });

      return Object.entries(ageBins).map(([ageRange, count]) => ({ ageRange, count }));
    }
    return [];
  };

  const generateSalaryExperienceData = () => {
    if (datasetId === 'demo-dataset-123' && (window as any).demoData) {
      const data = (window as any).demoData;
      return data.slice(0, 100).map((row: any) => ({
        experience: row.years_experience,
        salary: row.salary
      }));
    }
    return [];
  };

  const generateDepartmentData = () => {
    if (datasetId === 'demo-dataset-123' && (window as any).demoData) {
      const data = (window as any).demoData;
      const deptCounts: Record<string, number> = {};
      
      data.forEach((row: any) => {
        const dept = row.department;
        deptCounts[dept] = (deptCounts[dept] || 0) + 1;
      });

      return Object.entries(deptCounts).map(([name, value]) => ({ name, value }));
    }
    return [];
  };

  const generatePerformanceData = () => {
    if (datasetId === 'demo-dataset-123' && (window as any).demoData) {
      const data = (window as any).demoData;
      const scoreBins = { '1-3': 0, '4-5': 0, '6-7': 0, '8-9': 0, '10': 0 };
      
      data.forEach((row: any) => {
        const score = row.performance_score;
        if (score <= 3) scoreBins['1-3']++;
        else if (score <= 5) scoreBins['4-5']++;
        else if (score <= 7) scoreBins['6-7']++;
        else if (score <= 9) scoreBins['8-9']++;
        else scoreBins['10']++;
      });

      return Object.entries(scoreBins).map(([scoreRange, count]) => ({ scoreRange, count }));
    }
    return [];
  };

  const generateSalaryByAgeData = () => {
    if (datasetId === 'demo-dataset-123' && (window as any).demoData) {
      const data = (window as any).demoData;
      const ageGroups: Record<string, { total: number; count: number }> = {};
      
      data.forEach((row: any) => {
        const age = row.age;
        const salary = row.salary;
        let group = '';
        
        if (age < 30) group = '20-29';
        else if (age < 40) group = '30-39';
        else if (age < 50) group = '40-49';
        else if (age < 60) group = '50-59';
        else group = '60+';
        
        if (!ageGroups[group]) ageGroups[group] = { total: 0, count: 0 };
        ageGroups[group].total += salary;
        ageGroups[group].count++;
      });

      return Object.entries(ageGroups).map(([ageGroup, data]) => ({
        ageGroup,
        averageSalary: Math.round(data.total / data.count)
      }));
    }
    return [];
  };

  const startEDAAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      console.log('Starting EDA analysis for dataset:', datasetId);
      
      // Check if backend is reachable first
      try {
        const healthCheck = await fetch('http://localhost:8000/docs');
        console.log('Backend health check status:', healthCheck.status);
      } catch (healthError) {
        console.error('Backend health check failed:', healthError);
        throw new Error('Backend server is not reachable. Please ensure the server is running on http://localhost:8000');
      }
      
      // Start EDA analysis
      const response = await fetch(`http://localhost:8000/api/v1/eda/analyze/${datasetId}`, {
        method: 'POST',
      });

      console.log('EDA analysis response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('EDA analysis error:', errorData);
        throw new Error(errorData.detail || 'EDA analysis failed');
      }

      const result = await response.json();
      console.log('EDA analysis started, result:', result);
      const analysisId = result.data.analysis_id;

      // Poll for results
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds max
      
      const pollResults = async () => {
        try {
          setProgress(Math.min((attempts / maxAttempts) * 100, 90));
          
          const resultResponse = await fetch(`http://localhost:8000/api/eda/results/${analysisId}`);
          const resultData = await resultResponse.json();
          
          if (resultData.status === 'completed') {
            setEdaResult(resultData.data);
            setProgress(100);
            setIsLoading(false);
            return;
          }
          
          if (resultData.status === 'failed') {
            throw new Error(resultData.error || 'Analysis failed');
          }
          
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(pollResults, 1000);
          } else {
            throw new Error('Analysis timed out');
          }
        } catch (err) {
          console.error('EDA polling error:', err);
          setError(err instanceof Error ? err.message : 'Failed to get results');
          setIsLoading(false);
        }
      };

      setTimeout(pollResults, 1000);

    } catch (err) {
      console.error('EDA analysis failed:', err);
      setError(err instanceof Error ? err.message : 'EDA analysis failed');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check if this is demo data
    if (datasetId === 'demo-dataset-123' && (window as any).demoData) {
      // Generate realistic EDA results from the synthetic data
      const syntheticData = (window as any).demoData;
      
      const generateRealisticEDAResults = () => {
        // Calculate real statistics from synthetic data
        const ages = syntheticData.map((row: any) => row.age);
        const salaries = syntheticData.map((row: any) => row.salary);
        const experience = syntheticData.map((row: any) => row.years_experience);
        const performance = syntheticData.map((row: any) => row.performance_score);
        
        const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
        const std = (arr: number[]) => Math.sqrt(arr.reduce((sq, n) => sq + Math.pow(n - mean(arr), 2), 0) / arr.length);
        
        return {
          analysis_id: 'demo-eda-123',
          dataset_info: {
            filename: 'employee_analysis_demo.csv',
            total_rows: syntheticData.length,
            total_columns: 8,
            numerical_columns: ['age', 'years_experience', 'salary', 'performance_score', 'satisfaction_score'],
            categorical_columns: ['department', 'region', 'category'],
            missing_values_summary: { satisfaction_score: 12 } // Simulate some missing values
          },
          statistical_summary: {
            age: { 
              mean: Math.round(mean(ages) * 100) / 100, 
              std: Math.round(std(ages) * 100) / 100, 
              min: Math.min(...ages), 
              max: Math.max(...ages),
              median: ages.sort((a: number, b: number) => a - b)[Math.floor(ages.length / 2)]
            },
            salary: { 
              mean: Math.round(mean(salaries)), 
              std: Math.round(std(salaries)), 
              min: Math.min(...salaries), 
              max: Math.max(...salaries),
              median: salaries.sort((a: number, b: number) => a - b)[Math.floor(salaries.length / 2)]
            },
            years_experience: { 
              mean: Math.round(mean(experience) * 100) / 100, 
              std: Math.round(std(experience) * 100) / 100, 
              min: Math.min(...experience), 
              max: Math.max(...experience)
            },
            performance_score: {
              mean: Math.round(mean(performance) * 100) / 100,
              std: Math.round(std(performance) * 100) / 100,
              min: Math.min(...performance),
              max: Math.max(...performance)
            }
          },
          correlation_analysis: {
            high_correlations: [
              { column1: 'years_experience', column2: 'salary', correlation: 0.78 },
              { column1: 'age', column2: 'years_experience', correlation: 0.85 },
              { column1: 'performance_score', column2: 'salary', correlation: 0.42 },
              { column1: 'performance_score', column2: 'satisfaction_score', correlation: 0.67 }
            ]
          },
          outlier_detection: {
            outlier_summary: { 
              salary: 23, 
              age: 5, 
              performance_score: 8,
              years_experience: 12
            },
            outlier_percentage: 3.2
          },
          visualizations: {},
          processing_time: 1.8,
          memory_used_mb: 15.4
        };
      };

      // Set the results immediately (simulating instant analysis)
      setTimeout(() => {
        setEdaResult(generateRealisticEDAResults());
        setIsLoading(false);
        setProgress(100);
      }, 1500); // Small delay to show loading state
      
      return; // Skip the normal API call
    }
    
    startEDAAnalysis();
  }, [datasetId]);

  const downloadReport = () => {
    if (!edaResult) return;
    
    const reportData = {
      analysis_id: edaResult.analysis_id,
      dataset_info: edaResult.dataset_info,
      statistical_summary: edaResult.statistical_summary,
      correlation_analysis: edaResult.correlation_analysis,
      outlier_detection: edaResult.outlier_detection,
      processing_time: edaResult.processing_time,
      memory_used_mb: edaResult.memory_used_mb,
      generated_at: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eda_report_${edaResult.dataset_info.filename}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Running EDA Analysis
          </CardTitle>
          <CardDescription>
            Analyzing dataset ID: {datasetId}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Processing dataset...
              </p>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {progress.toFixed(0)}% complete
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <p><strong>Troubleshooting:</strong></p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Check if the backend server is running on http://localhost:8000</li>
              <li>Verify the dataset ID: {datasetId}</li>
              <li>Check browser console for detailed error messages</li>
              <li>Ensure the dataset was uploaded successfully</li>
            </ul>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={startEDAAnalysis} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Analysis
            </Button>
            <Button 
              onClick={() => {
                // Load demo data for testing
                setEdaResult({
                  analysis_id: 'demo-123',
                  dataset_info: {
                    filename: 'demo_dataset.csv',
                    total_rows: 1000,
                    total_columns: 10,
                    numerical_columns: ['age', 'salary', 'score'],
                    categorical_columns: ['category', 'region'],
                    missing_values_summary: { age: 5, salary: 2 }
                  },
                  statistical_summary: {
                    age: { mean: 35.5, std: 12.3, min: 18, max: 65 },
                    salary: { mean: 75000, std: 25000, min: 30000, max: 150000 }
                  },
                  correlation_analysis: {
                    high_correlations: [
                      { column1: 'age', column2: 'salary', correlation: 0.65 }
                    ]
                  },
                  outlier_detection: {
                    outlier_summary: { age: 15, salary: 8 },
                    outlier_percentage: 2.3
                  },
                  visualizations: {},
                  processing_time: 2.5,
                  memory_used_mb: 45.2
                });
                setError(null);
                setIsLoading(false);
              }} 
              variant="secondary"
            >
              Load Demo Data
            </Button>
            {onClose && (
              <Button onClick={onClose} variant="secondary">
                Close
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!edaResult) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                EDA Analysis Results
              </CardTitle>
              <CardDescription>
                {edaResult.dataset_info.filename} • 
                {edaResult.dataset_info.total_rows.toLocaleString()} rows • 
                {edaResult.dataset_info.total_columns} columns
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={downloadReport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
              {onClose && (
                <Button onClick={onClose} variant="secondary" size="sm">
                  Close
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {edaResult.dataset_info.numerical_columns.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Numerical Columns
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <PieChart className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {edaResult.dataset_info.categorical_columns.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Categorical Columns
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {edaResult.outlier_detection.outlier_percentage.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Outliers Detected
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
          <TabsTrigger value="outliers">Outliers</TabsTrigger>
          <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dataset Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">
                    Numerical Columns ({edaResult.dataset_info.numerical_columns.length})
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {edaResult.dataset_info.numerical_columns.slice(0, 10).map((col) => (
                      <Badge key={col} variant="secondary" className="text-xs">
                        {col}
                      </Badge>
                    ))}
                    {edaResult.dataset_info.numerical_columns.length > 10 && (
                      <Badge variant="outline" className="text-xs">
                        +{edaResult.dataset_info.numerical_columns.length - 10} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">
                    Categorical Columns ({edaResult.dataset_info.categorical_columns.length})
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {edaResult.dataset_info.categorical_columns.slice(0, 10).map((col) => (
                      <Badge key={col} variant="outline" className="text-xs">
                        {col}
                      </Badge>
                    ))}
                    {edaResult.dataset_info.categorical_columns.length > 10 && (
                      <Badge variant="outline" className="text-xs">
                        +{edaResult.dataset_info.categorical_columns.length - 10} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Missing Values */}
              {Object.keys(edaResult.dataset_info.missing_values_summary).length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">
                    Missing Values
                  </h4>
                  <div className="space-y-1">
                    {Object.entries(edaResult.dataset_info.missing_values_summary)
                      .filter(([_, count]) => count > 0)
                      .slice(0, 5)
                      .map(([column, count]) => (
                        <div key={column} className="flex justify-between text-sm">
                          <span>{column}</span>
                          <span className="text-red-600">{count} missing</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Correlation Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {edaResult.correlation_analysis.high_correlations.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">
                    High Correlations (|r| &gt; 0.7)
                  </h4>
                  {edaResult.correlation_analysis.high_correlations.map((corr, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">
                        {corr.column1} ↔ {corr.column2}
                      </span>
                      <Badge variant={Math.abs(corr.correlation) > 0.9 ? "destructive" : "secondary"}>
                        {corr.correlation.toFixed(3)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No high correlations detected</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Outlier Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm font-medium text-orange-800">
                    {edaResult.outlier_detection.outlier_percentage.toFixed(1)}% of data points are outliers
                  </p>
                </div>
                
                {Object.keys(edaResult.outlier_detection.outlier_summary).length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">
                      Outliers by Column
                    </h4>
                    <div className="space-y-1">
                      {Object.entries(edaResult.outlier_detection.outlier_summary)
                        .filter(([_, count]) => count > 0)
                        .map(([column, count]) => (
                          <div key={column} className="flex justify-between text-sm">
                            <span>{column}</span>
                            <span className="text-orange-600">{count} outliers</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualizations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Interactive Charts using dedicated components */}
            <AgeDistributionChart data={generateAgeDistribution()} />
            <SalaryExperienceChart data={generateSalaryExperienceData()} />
            <DepartmentDistributionChart data={generateDepartmentData()} />
            <PerformanceDistributionChart 
              data={generatePerformanceData()} 
            />
            <SalaryByAgeChart data={generateSalaryByAgeData()} />

            {/* Legacy visualizations from backend (if available) */}
            {edaResult.visualizations?.correlation_heatmap && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Correlation Heatmap</CardTitle>
                  <CardDescription>
                    Backend-generated correlation matrix
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <img
                    src={`data:image/png;base64,${edaResult.visualizations.correlation_heatmap}`}
                    alt="Correlation Heatmap"
                    className="w-full h-auto rounded-lg"
                  />
                </CardContent>
              </Card>
            )}

          </div>
        </TabsContent>
      </Tabs>

      {/* Performance Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>
              Analysis completed in {edaResult.processing_time.toFixed(2)} seconds
            </span>
            <span>
              Memory used: {edaResult.memory_used_mb.toFixed(1)} MB
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EDADashboard;
