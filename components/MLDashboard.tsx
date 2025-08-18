import React, { useState, useEffect } from 'react';
import { Brain, Target, TrendingUp, Award, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter
} from 'recharts';
import {
  ModelComparisonChart,
  FeatureImportanceChart,
  MetricsRadarChart,
  PredictionAccuracyChart,
  TrainingTimeChart
} from './InteractiveCharts';

interface ModelResult {
  model_name: string;
  algorithm_type: string;
  metrics: Record<string, any>;
  feature_importance?: number[];
  training_time: number;
  model_params: Record<string, any>;
}

interface MLResult {
  analysis_id: string;
  problem_type: string;
  dataset_info: {
    filename: string;
    total_rows: number;
    features_used: number;
    training_samples: number;
    test_samples: number;
  };
  feature_info: {
    numerical_features: string[];
    categorical_features: string[];
    features_used_in_training: string[];
  };
  processing_time: number;
  memory_used_mb: number;
  model_results: ModelResult[];
  best_model: string;
  visualizations?: {
    confusion_matrix?: string;
    feature_importance?: string;
    roc_curve?: string;
    learning_curve?: string;
  };
}

interface MLDashboardProps {
  datasetId: string;
  onClose?: () => void;
}

const MLDashboard: React.FC<MLDashboardProps> = ({ datasetId, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [mlResult, setMlResult] = useState<MLResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [targetColumn, setTargetColumn] = useState('');
  const [testSize, setTestSize] = useState(0.2);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);

  // Helper functions for generating chart data
  const generateModelComparisonData = () => {
    if (!mlResult?.model_results) return [];
    return mlResult.model_results.map(model => ({
      name: model.model_name,
      r2Score: model.metrics.r2_score || 0,
      mse: model.metrics.mean_squared_error || 0,
      mae: model.metrics.mean_absolute_error || 0,
      trainingTime: model.training_time
    }));
  };

  const generateFeatureImportanceData = () => {
    if (!mlResult?.model_results || !mlResult?.feature_info?.features_used_in_training) return [];
    
    const bestModel = mlResult.model_results.find(m => m.model_name === mlResult.best_model);
    if (!bestModel?.feature_importance) return [];

    return mlResult.feature_info.features_used_in_training.map((feature, index) => ({
      feature,
      importance: bestModel.feature_importance![index] || 0
    })).sort((a, b) => b.importance - a.importance);
  };

  const generateMetricsRadarData = () => {
    if (!mlResult?.model_results) return [];
    
    const bestModel = mlResult.model_results.find(m => m.model_name === mlResult.best_model);
    if (!bestModel) return [];

    return [
      {
        metric: 'R² Score',
        value: (bestModel.metrics.r2_score || 0) * 100,
        fullMark: 100
      },
      {
        metric: 'CV R² Mean',
        value: (bestModel.metrics.cv_r2_mean || 0) * 100,
        fullMark: 100
      },
      {
        metric: 'Speed',
        value: Math.max(0, 100 - (bestModel.training_time * 10)), // Inverse of training time
        fullMark: 100
      },
      {
        metric: 'Stability',
        value: Math.max(0, 100 - ((bestModel.metrics.cv_r2_std || 0) * 100)),
        fullMark: 100
      }
    ];
  };

  const generatePredictionAccuracyData = () => {
    if (datasetId === 'demo-dataset-123' && (window as any).demoData) {
      // Generate sample prediction vs actual data
      const sampleData = [];
      for (let i = 0; i < 50; i++) {
        const actual = 5 + Math.random() * 5; // Performance score 5-10
        const predicted = actual + (Math.random() - 0.5) * 2; // Add some noise
        sampleData.push({ actual, predicted });
      }
      return sampleData;
    }
    return [];
  };

  const getModelColor = (index: number) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    return colors[index % colors.length];
  };

  useEffect(() => {
    // Check if this is demo data
    if (datasetId === 'demo-dataset-123' && (window as any).demoData) {
      // For demo data, automatically set available columns and show pre-trained results
      const demoColumns = ['age', 'years_experience', 'salary', 'performance_score', 'satisfaction_score', 'department', 'region', 'category'];
      setAvailableColumns(demoColumns);
      
      // Set a default target column for demo
      setTargetColumn('performance_score');
      
      // Generate realistic ML results
      const generateRealisticMLResults = () => {
        return {
          analysis_id: 'demo-ml-123',
          problem_type: 'regression',
          dataset_info: {
            filename: 'employee_analysis_demo.csv',
            total_rows: 1000,
            features_used: 6,
            training_samples: 800,
            test_samples: 200
          },
          feature_info: {
            numerical_features: ['age', 'years_experience', 'salary', 'satisfaction_score'],
            categorical_features: ['department', 'region', 'category'],
            features_used_in_training: ['age', 'years_experience', 'salary', 'satisfaction_score']
          },
          processing_time: 12.4,
          memory_used_mb: 89.2,
          model_results: [
            {
              model_name: 'Random Forest',
              algorithm_type: 'regression',
              metrics: { 
                r2_score: 0.7841, 
                mean_squared_error: 45.23, 
                root_mean_squared_error: 6.73,
                mean_absolute_error: 4.89,
                cv_r2_mean: 0.7654, 
                cv_r2_std: 0.0423 
              },
              feature_importance: [0.42, 0.31, 0.18, 0.09],
              training_time: 3.2,
              model_params: { n_estimators: 100, random_state: 42, max_depth: 10 }
            },
            {
              model_name: 'Linear Regression',
              algorithm_type: 'regression',
              metrics: { 
                r2_score: 0.6234, 
                mean_squared_error: 78.45, 
                root_mean_squared_error: 8.86,
                mean_absolute_error: 6.72,
                cv_r2_mean: 0.6089, 
                cv_r2_std: 0.0312 
              },
              feature_importance: [0.38, 0.29, 0.22, 0.11],
              training_time: 0.4,
              model_params: { fit_intercept: true }
            },
            {
              model_name: 'Decision Tree',
              algorithm_type: 'regression',
              metrics: { 
                r2_score: 0.7156, 
                mean_squared_error: 59.32, 
                root_mean_squared_error: 7.70,
                mean_absolute_error: 5.44,
                cv_r2_mean: 0.6891, 
                cv_r2_std: 0.0567 
              },
              feature_importance: [0.35, 0.34, 0.19, 0.12],
              training_time: 1.1,
              model_params: { random_state: 42, max_depth: 8 }
            },
            {
              model_name: 'SVR',
              algorithm_type: 'regression',
              metrics: { 
                r2_score: 0.5987, 
                mean_squared_error: 83.67, 
                root_mean_squared_error: 9.15,
                mean_absolute_error: 7.23,
                cv_r2_mean: 0.5743, 
                cv_r2_std: 0.0445 
              },
              feature_importance: [0.33, 0.28, 0.25, 0.14],
              training_time: 4.8,
              model_params: { C: 1.0, kernel: 'rbf' }
            }
          ],
          best_model: 'Random Forest'
        };
      };

      // Show pre-trained results after a short delay
      setTimeout(() => {
        setMlResult(generateRealisticMLResults());
        toast.success('Demo ML models trained successfully! Random Forest achieved 78.4% R² score.');
      }, 2000);
      
      return; // Skip the normal dataset info fetch
    }
    
    // Fetch dataset info to get available columns
    const fetchDatasetInfo = async () => {
      try {
        console.log('Fetching dataset info for:', datasetId);
        const response = await fetch(`http://localhost:8000/api/files/datasets/${datasetId}`);
        console.log('Dataset info response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Dataset info:', data);
          const columns = [
            ...data.data.numerical_columns,
            ...data.data.categorical_columns
          ];
          setAvailableColumns(columns);
        } else {
          console.error('Failed to fetch dataset info, status:', response.status);
        }
      } catch (err) {
        console.error('Failed to fetch dataset info:', err);
      }
    };

    fetchDatasetInfo();
  }, [datasetId]);

  const startMLTraining = async () => {
    if (!targetColumn) {
      setError('Please select a target column');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      console.log('Starting ML training with target:', targetColumn, 'test size:', testSize);
      // Start ML training
      const response = await fetch(
        `http://localhost:8000/api/ml/train/${datasetId}?target_column=${encodeURIComponent(targetColumn)}&test_size=${testSize}`,
        {
          method: 'POST',
        }
      );

      console.log('ML training response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('ML training error:', errorData);
        throw new Error(errorData.detail || 'ML training failed');
      }

      const result = await response.json();
      console.log('ML training result:', result);
      setMlResult(result.data);
      setProgress(100);
      setIsLoading(false);

    } catch (err) {
      console.error('ML training failed:', err);
      setError(err instanceof Error ? err.message : 'ML training failed');
      setIsLoading(false);
    }
  };

  const downloadReport = () => {
    if (!mlResult) return;
    
    const reportData = {
      analysis_id: mlResult.analysis_id,
      problem_type: mlResult.problem_type,
      dataset_info: mlResult.dataset_info,
      feature_info: mlResult.feature_info,
      model_results: mlResult.model_results,
      best_model: mlResult.best_model,
      processing_time: mlResult.processing_time,
      memory_used_mb: mlResult.memory_used_mb,
      generated_at: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ml_report_${mlResult.dataset_info.filename}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getMetricDisplayName = (metric: string) => {
    const metricNames: Record<string, string> = {
      accuracy: 'Accuracy',
      cv_accuracy_mean: 'CV Accuracy (Mean)',
      cv_accuracy_std: 'CV Accuracy (Std)',
      r2_score: 'R² Score',
      mean_squared_error: 'MSE',
      root_mean_squared_error: 'RMSE',
      mean_absolute_error: 'MAE',
      cv_r2_mean: 'CV R² (Mean)',
      cv_r2_std: 'CV R² (Std)'
    };
    return metricNames[metric] || metric;
  };

  const getMetricValue = (value: any) => {
    if (typeof value === 'number') {
      return value.toFixed(4);
    }
    return String(value);
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Training ML Models
          </CardTitle>
          <CardDescription>
            Training multiple algorithms and evaluating performance...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Training models with target: {targetColumn}
              </p>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                This may take a few minutes...
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
              <li>Make sure you selected a valid target column</li>
            </ul>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={startMLTraining} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Training
            </Button>
            <Button 
              onClick={() => {
                // Load demo data for testing
                setMlResult({
                  analysis_id: 'demo-ml-123',
                  problem_type: 'classification',
                  dataset_info: {
                    filename: 'demo_dataset.csv',
                    total_rows: 1000,
                    features_used: 8,
                    training_samples: 800,
                    test_samples: 200
                  },
                  feature_info: {
                    numerical_features: ['age', 'salary', 'score'],
                    categorical_features: ['category', 'region'],
                    features_used_in_training: ['age', 'salary', 'score']
                  },
                  processing_time: 15.3,
                  memory_used_mb: 128.5,
                  model_results: [
                    {
                      model_name: 'Random Forest',
                      algorithm_type: 'classification',
                      metrics: { accuracy: 0.8750, cv_accuracy_mean: 0.8520 },
                      feature_importance: [0.35, 0.28, 0.22],
                      training_time: 2.1,
                      model_params: { n_estimators: 100, random_state: 42 }
                    },
                    {
                      model_name: 'Logistic Regression',
                      algorithm_type: 'classification',
                      metrics: { accuracy: 0.8200, cv_accuracy_mean: 0.8100 },
                      feature_importance: [0.40, 0.35, 0.25],
                      training_time: 0.8,
                      model_params: { random_state: 42, max_iter: 1000 }
                    }
                  ],
                  best_model: 'Random Forest'
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

  if (!mlResult) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Machine Learning Training
          </CardTitle>
          <CardDescription>
            Configure and train ML models on dataset: {datasetId}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target-column">Target Column</Label>
              <Select value={targetColumn} onValueChange={setTargetColumn}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target column" />
                </SelectTrigger>
                <SelectContent>
                  {availableColumns.map((column) => (
                    <SelectItem key={column} value={column}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="test-size">Test Set Size</Label>
              <Input
                id="test-size"
                type="number"
                min="0.1"
                max="0.5"
                step="0.05"
                value={testSize}
                onChange={(e) => setTestSize(parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={startMLTraining}
              disabled={!targetColumn}
              className="flex-1"
            >
              <Brain className="h-4 w-4 mr-2" />
              Start Training
            </Button>
            {onClose && (
              <Button onClick={onClose} variant="secondary">
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const classificationModels = mlResult.model_results.filter(m => m.algorithm_type === 'classification');
  const regressionModels = mlResult.model_results.filter(m => m.algorithm_type === 'regression');

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                ML Training Results
              </CardTitle>
              <CardDescription>
                {mlResult.dataset_info.filename} • 
                {mlResult.problem_type} • 
                Target: {targetColumn}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold capitalize">
                  {mlResult.problem_type}
                </p>
                <p className="text-xs text-muted-foreground">
                  Problem Type
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {mlResult.dataset_info.features_used}
                </p>
                <p className="text-xs text-muted-foreground">
                  Features Used
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {mlResult.model_results.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Models Trained
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Award className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-lg font-bold">
                  {mlResult.best_model}
                </p>
                <p className="text-xs text-muted-foreground">
                  Best Model
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model Results */}
      <Tabs defaultValue="results" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="results">Model Results</TabsTrigger>
          <TabsTrigger value="comparison">Model Comparison</TabsTrigger>
          <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
          <TabsTrigger value="details">Training Details</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          {classificationModels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Classification Models</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {classificationModels.map((model) => (
                    <Card key={model.model_name} className="border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center justify-between">
                          {model.model_name}
                          {model.model_name === mlResult.best_model && (
                            <Badge variant="default">Best</Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {Object.entries(model.metrics)
                          .filter(([key]) => !['confusion_matrix', 'classification_report'].includes(key))
                          .map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="text-gray-600">{getMetricDisplayName(key)}</span>
                              <span className="font-medium">{getMetricValue(value)}</span>
                            </div>
                          ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {regressionModels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Regression Models</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {regressionModels.map((model) => (
                    <Card key={model.model_name} className="border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center justify-between">
                          {model.model_name}
                          {model.model_name === mlResult.best_model && (
                            <Badge variant="default">Best</Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {Object.entries(model.metrics).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-600">{getMetricDisplayName(key)}</span>
                            <span className="font-medium">{getMetricValue(value)}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          {/* Model Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Model Performance Comparison Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Model Performance Comparison
                </CardTitle>
                <CardDescription>
                  R² Score comparison across different algorithms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={generateModelComparisonData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                    <Bar dataKey="r2Score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Feature Importance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Feature Importance
                </CardTitle>
                <CardDescription>
                  Most influential features in the best model ({mlResult.best_model})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={generateFeatureImportanceData()} layout="horizontal" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                    <YAxis dataKey="feature" type="category" width={70} />
                    <Bar dataKey="importance" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Model Metrics Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Best Model Performance Profile
                </CardTitle>
                <CardDescription>
                  Multi-dimensional performance analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={generateMetricsRadarData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <Radar
                      name="Performance"
                      dataKey="value"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Prediction Accuracy Scatter Plot */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Prediction vs Actual
                </CardTitle>
                <CardDescription>
                  How well predictions match actual values
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={generatePredictionAccuracyData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="actual" name="Actual" domain={[0, 10]} />
                    <YAxis dataKey="predicted" name="Predicted" domain={[0, 10]} />
                    <Scatter fill="#f59e0b" />
                    {/* Perfect prediction line */}
                    <Line data={[{actual: 0, predicted: 0}, {actual: 10, predicted: 10}]} stroke="#ef4444" strokeDasharray="5 5" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

          </div>

          {/* Model Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Model Comparison</CardTitle>
              <CardDescription>
                Complete performance metrics for all trained models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Model</th>
                      <th className="text-left p-2">Type</th>
                      {mlResult.problem_type === 'classification' ? (
                        <th className="text-left p-2">Accuracy</th>
                      ) : (
                        <th className="text-left p-2">R² Score</th>
                      )}
                      <th className="text-left p-2">MAE</th>
                      <th className="text-left p-2">Training Time</th>
                      <th className="text-left p-2">CV Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mlResult.model_results.map((model, index) => (
                      <tr key={model.model_name} className="border-b" style={{backgroundColor: model.model_name === mlResult.best_model ? '#f0f9ff' : 'transparent'}}>
                        <td className="p-2 font-medium">
                          {model.model_name}
                          {model.model_name === mlResult.best_model && (
                            <Badge variant="outline" className="ml-2 text-xs">Best</Badge>
                          )}
                        </td>
                        <td className="p-2 capitalize">{model.algorithm_type}</td>
                        <td className="p-2">
                          <span style={{color: getModelColor(index)}}>
                            {mlResult.problem_type === 'classification'
                              ? getMetricValue(model.metrics.accuracy)
                              : getMetricValue(model.metrics.r2_score)}
                          </span>
                        </td>
                        <td className="p-2">{getMetricValue(model.metrics.mean_absolute_error)}</td>
                        <td className="p-2">{model.training_time.toFixed(2)}s</td>
                        <td className="p-2">{getMetricValue(model.metrics.cv_r2_mean)} ± {getMetricValue(model.metrics.cv_r2_std)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualizations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Interactive Charts using dedicated components */}
            <ModelComparisonChart data={generateModelComparisonData()} />
            <FeatureImportanceChart 
              data={generateFeatureImportanceData()} 
              bestModel={mlResult?.best_model || ''} 
            />
            <MetricsRadarChart data={generateMetricsRadarData()} />
            <PredictionAccuracyChart data={generatePredictionAccuracyData()} />
            <TrainingTimeChart data={generateModelComparisonData()} />

            {/* Backend visualizations if available */}
            {mlResult.visualizations?.confusion_matrix && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Confusion Matrix</CardTitle>
                  <CardDescription>
                    Backend-generated confusion matrix for {mlResult.best_model}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <img
                    src={`data:image/png;base64,${mlResult.visualizations.confusion_matrix}`}
                    alt="Confusion Matrix"
                    className="w-full h-auto rounded-lg"
                  />
                </CardContent>
              </Card>
            )}

            {mlResult.visualizations?.feature_importance && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Feature Importance Plot</CardTitle>
                  <CardDescription>
                    Backend-generated feature importance visualization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <img
                    src={`data:image/png;base64,${mlResult.visualizations.feature_importance}`}
                    alt="Feature Importance"
                    className="w-full h-auto rounded-lg"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Total Samples</p>
                  <p className="text-lg font-semibold">
                    {mlResult.dataset_info.total_rows.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Training Samples</p>
                  <p className="text-lg font-semibold">
                    {mlResult.dataset_info.training_samples.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Test Samples</p>
                  <p className="text-lg font-semibold">
                    {mlResult.dataset_info.test_samples.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Features</p>
                  <p className="text-lg font-semibold">
                    {mlResult.dataset_info.features_used}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">
                  Features Used in Training
                </h4>
                <div className="flex flex-wrap gap-1">
                  {mlResult.feature_info.features_used_in_training.map((feature) => (
                    <Badge key={feature} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Performance Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>
              Training completed in {mlResult.processing_time.toFixed(2)} seconds
            </span>
            <span>
              Memory used: {mlResult.memory_used_mb.toFixed(1)} MB
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MLDashboard;
