import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import AuthCard from './components/AuthCard';
import { Toaster, toast } from 'sonner';
import { HomeSection } from './components/HomeSection';
import { LearnSection } from './components/LearnSection';
import { MLLearnSection } from './components/MLLearnSection';
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

function App() {
  // Session management: check token expiration
  useEffect(() => {
    const checkTokenExpiry = () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp) {
          const expiry = payload.exp * 1000; // JWT exp is in seconds
          if (Date.now() > expiry) {
            localStorage.removeItem('token');
            toast.info('Session expired. Please log in again.');
            window.location.href = '/login';
          }
        }
      } catch {}
    };
    checkTokenExpiry();
    const interval = setInterval(checkTokenExpiry, 60 * 1000); // check every minute
    return () => clearInterval(interval);
  }, []);
  // Initialize uploadedDataset from localStorage if available
  const [uploadedDataset, setUploadedDataset] = useState<UploadedDataset | null>(() => {
    const saved = localStorage.getItem('uploadedDataset');
    return saved ? JSON.parse(saved) : null;
  });

  const isAuthenticated = () => !!localStorage.getItem('token');
  const getUserEmail = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.email || null;
    } catch {
      return null;
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.info('Logged out successfully');
    window.location.href = '/';
  };
  const handleFileUploaded = (dataset: UploadedDataset) => {
    setUploadedDataset(dataset);
    localStorage.setItem('uploadedDataset', JSON.stringify(dataset));
  };
  const handleLoadDemoDataset = () => {
    const generateSyntheticData = () => {
      const employees = [];
      const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];
      const regions = ['North America', 'Europe', 'Asia', 'South America'];
      const categories = ['Junior', 'Mid-level', 'Senior', 'Lead', 'Manager'];
      for (let i = 0; i < 1000; i++) {
        const age = Math.floor(Math.random() * 40) + 22;
        const yearsExperience = Math.min(age - 22, Math.floor(Math.random() * 25));
        const baseSalary = 40000 + (yearsExperience * 3000) + (Math.random() * 20000);
        const performanceScore = 60 + Math.random() * 40;
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
    const demoDataset = {
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
    (window as any).demoData = syntheticData;
    toast.success('🎉 Demo dataset generated with 1,000 employee records! Running EDA analysis...');
    setTimeout(() => {
      toast.info('💡 Tip: Switch to \"🤖 ML Models\" tab to see pre-trained machine learning results!');
    }, 3000);
    // Navigate to ML tab after EDA
    setTimeout(() => {
      window.location.href = '/ml';
    }, 100);
  };

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-2 sm:px-4">
          <header className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-2 sm:px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-green-400 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm" aria-hidden="true">📊</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">SmartEDA</h1>
                    {uploadedDataset && isAuthenticated() && (
                      <p className="text-xs text-gray-500">
                        Dataset: {uploadedDataset.original_filename} ({uploadedDataset.row_count.toLocaleString()} rows)
                      </p>
                    )}
                    {isAuthenticated() && (
                      <p className="text-xs text-green-700 mt-1">Logged in as: {getUserEmail()}</p>
                    )}
                  </div>
                </div>
                <nav className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 items-center">
                  {isAuthenticated() ? (
                    <>
                      <Link to="/" className="px-3 py-2 text-sm font-medium rounded-md text-gray-500 hover:text-gray-700" aria-current={window.location.pathname === '/' ? 'page' : undefined}>Home</Link>
                      <Link to="/upload" className="px-3 py-2 text-sm font-medium rounded-md text-gray-500 hover:text-gray-700" aria-current={window.location.pathname === '/upload' ? 'page' : undefined}>Upload</Link>
                      {uploadedDataset && (
                        <>
                          <Link to="/eda" className="px-3 py-2 text-sm font-medium rounded-md text-gray-500 hover:text-gray-700" aria-current={window.location.pathname === '/eda' ? 'page' : undefined}>📊 EDA Report</Link>
                          <Link to="/ml" className="px-3 py-2 text-sm font-medium rounded-md text-gray-500 hover:text-gray-700" aria-current={window.location.pathname === '/ml' ? 'page' : undefined}>🤖 ML Models</Link>
                        </>
                      )}
                      <button
                        onClick={handleLogout}
                        className="px-3 py-2 text-sm font-medium rounded-md bg-red-100 text-red-700 ml-2"
                        aria-label="Logout"
                      >
                        Logout
                      </button>
                      <button 
                        onClick={handleLoadDemoDataset}
                        className="px-3 py-2 text-sm font-medium rounded-md text-purple-600 hover:text-purple-800 border border-purple-200 hover:bg-purple-50"
                        aria-label="Load Demo Data"
                      >
                        Demo Data
                      </button>
                    </>
                  ) : null}
                </nav>
              </div>
            </div>
          </header>
          <main className="pt-4" role="main">
            <Routes>
              {!isAuthenticated() ? (
                <>
                  <Route path="/register" element={<div className="container mx-auto px-4 py-8"><AuthCard /></div>} />
                  <Route path="/login" element={<div className="container mx-auto px-4 py-8"><AuthCard /></div>} />
                  <Route path="*" element={<Navigate to="/login" />} />
                </>
              ) : (
                <>
                  <Route path="/" element={<HomeSection />} />
                  <Route path="/upload" element={<FileUpload onFileUploaded={handleFileUploaded} />} />
                  <Route path="/eda" element={uploadedDataset ? (
                    <ErrorBoundary>
                      <EDADashboard datasetId={uploadedDataset.dataset_id} />
                    </ErrorBoundary>
                  ) : <Navigate to="/upload" />} />
                  <Route path="/ml" element={uploadedDataset ? (
                    <ErrorBoundary>
                      <MLDashboard datasetId={uploadedDataset.dataset_id} onClose={() => window.location.href = '/upload'} />
                    </ErrorBoundary>
                  ) : <Navigate to="/upload" />} />
                  <Route path="/learn" element={<MLLearnSection />} />
                  <Route path="/register" element={<Navigate to="/" />} />
                  <Route path="/login" element={<Navigate to="/" />} />
                  <Route path="*" element={<HomeSection />} />
                </>
              )}
            </Routes>
          </main>
          <Toaster />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;