import React, { useState } from "react";
import { FileUpload } from "./components/FileUpload";
import { EDACards } from "./components/EDACards";
import { MLSection } from "./components/MLSection";
import { HomeSection } from "./components/HomeSection";

export default function App() {
  const [activeTab, setActiveTab] = useState("Home");
  // Shared state for uploaded file and target column
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string>("");

  // Listen for custom tab switch events from CTA cards
  React.useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (typeof e.detail === "string") {
        setActiveTab(e.detail);
      }
    };
    window.addEventListener("switchTab", handler as EventListener);
    return () => window.removeEventListener("switchTab", handler as EventListener);
  }, []);

  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-green-400 rounded-xl shadow-md flex items-center justify-center">
                <span className="text-white text-xl">📊</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">SmartEDA</h1>
                <div className="text-xs text-gray-500 font-medium -mt-1">Data Analytics Platform</div>
              </div>
              <nav className="hidden lg:flex items-center space-x-8">
                <button onClick={() => setActiveTab("Home")} className={`text-sm font-semibold pb-1 ${activeTab === "Home" ? "text-gray-900 border-b-2 border-blue-400" : "text-gray-600 hover:text-gray-900"}`}>Home</button>
                <button onClick={() => setActiveTab("Upload Data")} className={`text-sm font-medium pb-1 ${activeTab === "Upload Data" ? "text-gray-900 border-b-2 border-blue-400" : "text-gray-600 hover:text-gray-900"}`}>Upload Data</button>
                <button onClick={() => setActiveTab("EDA Report")} className={`text-sm font-medium pb-1 ${activeTab === "EDA Report" ? "text-gray-900 border-b-2 border-blue-400" : "text-gray-600 hover:text-gray-900"}`}>EDA Report</button>
                <button onClick={() => setActiveTab("ML Models")} className={`text-sm font-medium pb-1 ${activeTab === "ML Models" ? "text-gray-900 border-b-2 border-blue-400" : "text-gray-600 hover:text-gray-900"}`}>ML Models</button>
              </nav>
              <button className="px-6 py-2 bg-gradient-to-r from-blue-400 to-green-400 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all">Get Started</button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        {activeTab === "Home" && <HomeSection />}
        {activeTab === "Upload Data" && (
          <FileUpload
            uploadedFile={uploadedFile}
            setUploadedFile={setUploadedFile}
            selectedTarget={selectedTarget}
            setSelectedTarget={setSelectedTarget}
          />
        )}
        {activeTab === "EDA Report" && (
          <EDACards
            uploadedFile={uploadedFile}
            selectedTarget={selectedTarget}
          />
        )}
        {activeTab === "ML Models" && (
          <MLSection
            uploadedFile={uploadedFile}
            targetColumn={selectedTarget}
          />
        )}
      </main>
      <footer className="border-t border-gray-200 bg-gray-50 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-sm text-gray-600">© 2025 SmartEDA. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Terms of Service</a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

