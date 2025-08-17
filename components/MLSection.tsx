import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Brain, Zap, TrendingUp, Play, Download, Share, Rocket } from "lucide-react";

export function MLSection({ uploadedFile, targetColumn }: { uploadedFile: File | null, targetColumn: string }) {
  const [selectedModel, setSelectedModel] = useState("");
  const [isTraining, setIsTraining] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [mlResult, setMlResult] = useState<any>(null);
  const [mlError, setMlError] = useState<string | null>(null);

  const models = [
    { value: "linear", label: "Linear Regression", type: "Regression", icon: "📈" },
    { value: "logistic", label: "Logistic Regression", type: "Classification", icon: "🔍" },
    { value: "random-forest", label: "Random Forest", type: "Both", icon: "🌳" },
    { value: "xgboost", label: "XGBoost", type: "Both", icon: "⚡" },
    { value: "svm", label: "Support Vector Machine", type: "Both", icon: "🎯" },
  ];


  // ML API request
  const handleTrain = async () => {
    if (!selectedModel || !targetColumn || !uploadedFile) return;
    setIsTraining(true);
    setMlError(null);
    setMlResult(null);
    setShowResults(false);
    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("target_column", targetColumn);
      formData.append("model", selectedModel);
      const response = await fetch("http://localhost:8000/ml/", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("ML request failed");
      const data = await response.json();
      setMlResult(data);
      setShowResults(true);
    } catch (err: any) {
      setMlError(err.message || "Unknown error");
    } finally {
      setIsTraining(false);
    }
  };

  // Reset results if file or target changes
  useEffect(() => {
    setMlResult(null);
    setShowResults(false);
    setMlError(null);
    setIsTraining(false);
    setSelectedModel("");
  }, [uploadedFile, targetColumn]);

  return (
    <section className="w-full max-w-7xl mx-auto py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
          Machine Learning <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">Models</span>
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Train and evaluate state-of-the-art ML models on your dataset with just a few clicks
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Model Selection */}
        <Card className="xl:col-span-2 border-0 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="px-10 py-8 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardTitle className="flex items-center text-2xl">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mr-4 shadow-md bg-gradient-to-r from-blue-400 to-purple-500">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-gray-900 font-bold">Model Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10 space-y-8">
            <div>
              <label className="block font-semibold text-gray-900 mb-4 text-lg">Select Machine Learning Model</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger
                  className="h-14 rounded-xl border-2 border-gray-300 text-lg font-medium font-inter bg-white text-gray-900 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-400"
                  style={{ transition: 'all 0.15s cubic-bezier(0.4,0,0.2,1)' }}
                >
                  <SelectValue placeholder="Choose a machine learning algorithm" />
                </SelectTrigger>
                <SelectContent
                  className="bg-gradient-to-br from-blue-50 to-green-50 border border-gray-200 shadow-xl rounded-xl text-gray-900 font-inter"
                  style={{ minWidth: '18rem' }}
                >
                  {models.map((model) => (
                    <SelectItem key={model.value} value={model.value} className="py-4 hover:bg-blue-100 focus:bg-blue-100 text-gray-900 font-inter">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <span className="text-xl mr-3">{model.icon}</span>
                          <span className="font-medium text-lg">{model.label}</span>
                        </div>
                        <Badge 
                          className={`ml-4 px-3 py-1 text-sm font-medium rounded-lg shadow-sm text-white ${
                            model.type === 'Both' ? 'bg-green-400 hover:bg-green-400' : 'bg-blue-400 hover:bg-blue-400'
                          }`}
                        >
                          {model.type}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block font-semibold text-gray-900 mb-4 text-lg">Target Variable (What to Predict)</label>
              <input
                type="text"
                value={targetColumn}
                disabled
                className="h-14 rounded-xl border-2 text-lg font-medium px-4 bg-gray-100 text-gray-700"
                placeholder="Target column"
              />
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="text-gray-600 font-medium">
                <div className="text-lg">🚀 Auto-optimized training pipeline</div>
                <div className="text-sm mt-1">80% training • 20% testing • Cross-validation included</div>
              </div>
              <Button
                onClick={handleTrain}
                disabled={!selectedModel || !targetColumn || !uploadedFile || isTraining}
                className="h-14 px-10 text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 bg-gradient-to-r from-green-400 to-green-500 text-white border-0"
              >
                {isTraining ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                    Training...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Play className="h-5 w-5 mr-3" />
                    Train Model
                  </div>
                )}
              </Button>
            </div>

            {isTraining && (
              <div className="space-y-4 p-6 rounded-xl bg-green-50">
                <div className="flex justify-between text-lg font-medium">
                  <span>Training Progress</span>
                  <span className="text-gray-600">Running...</span>
                </div>
                <Progress value={75} className="h-3 rounded-full" />
                <div className="text-sm text-gray-600 font-medium">
                  🔄 Hyperparameter optimization • ⚡ Feature selection • 📊 Cross-validation
                </div>
              </div>
            )}
            {mlError && <div className="text-red-700 mt-4">{mlError}</div>}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {/* Optionally, show training stats from mlResult if available */}
        {mlResult && mlResult.stats && (
          <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="px-8 py-8 bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardTitle className="flex items-center text-xl">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-4 shadow-md bg-gradient-to-r from-yellow-400 to-orange-400">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="text-gray-900 font-bold">Training Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="font-medium text-gray-700">Training Samples</span>
                <Badge className="px-4 py-2 text-sm font-semibold rounded-lg shadow-sm bg-blue-400 text-white hover:bg-blue-400">
                  {mlResult.stats.train_samples}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="font-medium text-gray-700">Test Samples</span>
                <Badge className="px-4 py-2 text-sm font-semibold rounded-lg shadow-sm bg-green-400 text-white hover:bg-green-400">
                  {mlResult.stats.test_samples}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="font-medium text-gray-700">Features</span>
                <Badge className="px-4 py-2 text-sm font-semibold rounded-lg shadow-sm bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                  {mlResult.stats.features}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="font-medium text-gray-700">Model Type</span>
                <Badge 
                  variant="outline" 
                  className="px-4 py-2 text-sm font-semibold rounded-lg border-2"
                >
                  {selectedModel ? models.find(m => m.value === selectedModel)?.type : "Not Selected"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results */}
      {showResults && mlResult && (
        <Card className="mt-12 border-0 shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="px-10 py-8 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center text-2xl">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mr-4 shadow-md bg-green-400">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-gray-900 font-bold">Model Performance Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
              <div className="text-center">
                <div className="text-4xl font-bold mb-3 text-blue-500">
                  {mlResult.metrics?.accuracy ? (mlResult.metrics.accuracy * 100).toFixed(1) + "%" : "-"}
                </div>
                <p className="text-gray-600 font-semibold">Accuracy</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-3 text-green-500">
                  {mlResult.metrics?.precision ? (mlResult.metrics.precision * 100).toFixed(1) + "%" : "-"}
                </div>
                <p className="text-gray-600 font-semibold">Precision</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-3">
                  {mlResult.metrics?.recall ? (mlResult.metrics.recall * 100).toFixed(1) + "%" : "-"}
                </div>
                <p className="text-gray-600 font-semibold">Recall</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-3">
                  {mlResult.metrics?.f1Score ? (mlResult.metrics.f1Score * 100).toFixed(1) + "%" : "-"}
                </div>
                <p className="text-gray-600 font-semibold">F1-Score</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600 mb-3">
                  {mlResult.metrics?.rSquared ? (mlResult.metrics.rSquared * 100).toFixed(1) + "%" : "-"}
                </div>
                <p className="text-gray-600 font-semibold">R²</p>
              </div>
            </div>

            <div className="mb-8 p-8 rounded-2xl shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
              <p className="text-lg font-semibold text-green-700">
                {mlResult.message || "Model training completed. See metrics above."}
              </p>
            </div>

            <div className="mb-8">
              <strong>Predictions (sample):</strong>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{JSON.stringify(mlResult.predictions, null, 2)}</pre>
            </div>

            {/* Show base64 images if any */}
            {mlResult.visualizations && Object.entries(mlResult.visualizations).map(([key, img]) => (
              <div key={key} className="mb-4">
                <strong>{key.replace(/_/g, ' ')}:</strong><br />
                <img src={`data:image/png;base64,${img}`} alt={key} style={{maxWidth: '100%'}} />
              </div>
            ))}

            <div className="flex flex-wrap justify-center gap-6">
              <Button 
                variant="outline" 
                className="h-12 px-8 font-semibold rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                <Download className="h-5 w-5 mr-3" />
                Download Model
              </Button>
              <Button 
                variant="outline" 
                className="h-12 px-8 font-semibold rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                <Share className="h-5 w-5 mr-3" />
                Export Predictions
              </Button>
              <Button className="h-12 px-8 font-semibold rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 bg-gradient-to-r from-blue-400 to-green-400 text-white border-0">
                <Rocket className="h-5 w-5 mr-3" />
                Deploy Model
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}