import React, { useState } from 'react';
import { Toaster, toast } from 'sonner';
import { HomeSection } from './components/HomeSection';
import { LearnSection } from './components/LearnSection';
import FileUpload from './components/FileUpload';
import EDADashboard from './components/EDADashboard';
import MLDashboard from './components/MLDashboard';
import './styles/globals.css';

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

type ViewState = 'home' | 'upload' | 'eda' | 'ml' | 'learn';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [uploadedDataset, setUploadedDataset] = useState<UploadedDataset | null>(null);

  // Listen for navigation events from HomeSection
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail === 'ml') {
        setCurrentView('learn');
      }
    };
    window.addEventListener('navigateView', handler);
    return () => window.removeEventListener('navigateView', handler);
  }, []);

  const handleFileUploaded = (dataset: UploadedDataset) => {
    setUploadedDataset(dataset);
  };

  const handleStartEDA = () => {
    setCurrentView('eda');
  };

  const handleStartML = () => {
    setCurrentView('ml');
  };

  const handleNavigateHome = () => {
    setCurrentView('home');
    setUploadedDataset(null);
  };

  const handleNavigateUpload = () => {
    setCurrentView('upload');
    setUploadedDataset(null); // Reset dataset so upload view is clean
  };

  const handleLoadDemoDataset = () => {
    // Generate realistic synthetic dataset
    const generateSyntheticData = () => {
      const employees = [];
      const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];
      const regions = ['North America', 'Europe', 'Asia', 'South America'];
      const categories = ['Junior', 'Mid-level', 'Senior', 'Lead', 'Manager'];
      
      for (let i = 0; i < 1000; i++) {
        const age = Math.floor(Math.random() * 40) + 22; // 22-62 years
        const yearsExperience = Math.min(age - 22, Math.floor(Math.random() * 25));
        const baseSalary = 40000 + (yearsExperience * 3000) + (Math.random() * 20000);
        const performanceScore = 60 + Math.random() * 40; // 60-100
        
        employees.push({
          id: i + 1,
          age,
          years_experience: yearsExperience,
          salary: Math.round(baseSalary),
          performance_score: Math.round(performanceScore * 100) / 100,
          department: departments[Math.floor(Math.random() * departments.length)],
          region: regions[Math.floor(Math.random() * regions.length)],
          category: categories[Math.floor(Math.random() * categories.length)],
          satisfaction_score: Math.round((performanceScore + Math.random() * 20 - 10) * 100) / 100
        });
      }
      return employees;
    };

    const syntheticData = generateSyntheticData();
    
    const demoDataset: UploadedDataset = {
      dataset_id: 'demo-dataset-123',
      original_filename: 'employee_analysis_demo.csv',
      file_size: 125000,
      file_type: 'csv',
      row_count: syntheticData.length,
      column_count: 8,
      numerical_columns: ['age', 'years_experience', 'salary', 'performance_score', 'satisfaction_score'],
      categorical_columns: ['department', 'region', 'category'],
      created_at: new Date().toISOString()
    };
    
    setUploadedDataset(demoDataset);
    
    // Store the synthetic data globally for the demo components to use
    (window as any).demoData = syntheticData;
    
    // Show notification and navigate to EDA
    toast.success('🎉 Demo dataset generated with 1,000 employee records! Running EDA analysis...');
    
    // Navigate to EDA to show the analysis automatically
    setCurrentView('eda');
    
    // After a delay, show additional notification about ML
    setTimeout(() => {
      toast.info('💡 Tip: Switch to "🤖 ML Models" tab to see pre-trained machine learning results!');
    }, 3000);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomeSection />;
      case 'upload':
        return (
          <div className="container mx-auto px-4 py-8">
            <FileUpload
              onFileUploaded={handleFileUploaded}
              onStartEDA={handleStartEDA}
              onStartML={handleStartML}
            />
          </div>
        );
      case 'eda':
        return uploadedDataset ? (
          <div className="container mx-auto px-4 py-8">
            <EDADashboard
              datasetId={uploadedDataset.dataset_id}
              onClose={handleNavigateUpload}
            />
          </div>
        ) : (
          <div className="container mx-auto px-4 py-8 text-center">
            <p className="text-gray-500">No dataset selected</p>
          </div>
        );
      case 'ml':
        return uploadedDataset ? (
          <div className="container mx-auto px-4 py-8">
            <MLDashboard
              datasetId={uploadedDataset.dataset_id}
              onClose={handleNavigateUpload}
            />
          </div>
        ) : (
          <div className="container mx-auto px-4 py-8 text-center">
            <p className="text-gray-500">No dataset selected</p>
          </div>
        );
      case 'learn':
        // Pass demoData from window if available
        const demoData = (window as any).demoData;
        return <LearnSection demoData={demoData} />;
      default:
        return <HomeSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Simple Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-green-400 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📊</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SmartEDA</h1>
                {uploadedDataset && (
                  <p className="text-xs text-gray-500">
                    Dataset: {uploadedDataset.original_filename} ({uploadedDataset.row_count.toLocaleString()} rows)
                  </p>
                )}
              </div>
            </div>
            <nav className="flex space-x-4">
              <button 
                onClick={handleNavigateHome}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  currentView === 'home' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Home
              </button>
              <button 
                onClick={handleNavigateUpload}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  currentView === 'upload' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Upload
              </button>
              
              {/* Show EDA and ML tabs only when dataset is loaded */}
              {uploadedDataset && (
                <>
                  <button 
                    onClick={handleStartEDA}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentView === 'eda' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    📊 EDA Report
                  </button>
                  <button 
                    onClick={handleStartML}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentView === 'ml' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    🤖 ML Models
                  </button>
                </>
              )}
              
              <button 
                onClick={handleLoadDemoDataset}
                className="px-3 py-2 text-sm font-medium rounded-md text-purple-600 hover:text-purple-800 border border-purple-200 hover:bg-purple-50"
              >
                Demo Data
              </button>
            </nav>
          </div>
        </div>
      </header>
      <main className="pt-4">
        {renderCurrentView()}
      </main>
      <Toaster />
    </div>
  );
}

export default App;

