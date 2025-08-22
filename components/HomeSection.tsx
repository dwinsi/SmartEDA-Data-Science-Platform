import React, { useState } from "react";
// Gradient background style using the selected palette
const gradientBg = {
  background: 'linear-gradient(135deg, #fcfcfc 0%, #ced6ed 16%, #a1afd3 40%, #808bd0 60%, #5b81d7 80%, #4755a2 100%)',
  minHeight: '100vh',
  width: '100%',
};
import { CTACard } from "./CTACard";
import { InteractiveCharts, DemoChartProps } from "./InteractiveCharts";
import Papa from "papaparse";

export function HomeSection() {
  const [demoData, setDemoData] = useState<DemoChartProps["demoData"]>(undefined);
  const [showDemoCharts, setShowDemoCharts] = useState(false);

  // Handler functions for CTA cards (these would ideally use context or props to switch tabs)
  const handleDemoDataset = async () => {
    // Load demo CSV from public folder
    const response = await fetch("/demo-dataset.csv");
    const csvText = await response.text();
    Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        // Filter out any empty rows and ensure correct types
        const parsed = (results.data as Array<{ Category?: string; Value?: number }>).
          filter(row => row.Category && typeof row.Value === "number");
        setDemoData(parsed as DemoChartProps["demoData"]);
        setShowDemoCharts(true);
      },
    });
  };
  const handleExploreML = () => {
    // Use a custom event to trigger navigation in App
    const evt = new CustomEvent("navigateView", { detail: "ml" });
    window.dispatchEvent(evt);
  };

  return (
    <section style={gradientBg}>
      {/* ...existing code... */}
      <div className="text-center mb-16">
        <h1 className="text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-white drop-shadow-lg">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-gradient4 to-gradient6 bg-clip-text text-transparent font-extrabold">
            SmartEDA
          </span>
        </h1>
        <p className="text-xl lg:text-2xl max-w-4xl mx-auto leading-relaxed text-gradient6 drop-shadow">
          Upload your dataset and get instant exploratory data analysis with powerful visualizations and machine learning insights.
        </p>
      </div>
      <div className="flex flex-col md:flex-row justify-center gap-8 mb-12">
        <div className="transition-transform duration-200 hover:scale-105 hover:shadow-2xl rounded-2xl border border-gradient4 bg-gradient1/80 p-8 shadow-xl">
          <CTACard
            title="Try Demo Dataset"
            description="Explore SmartEDA features instantly with a sample dataset."
            icon={<span>🧪</span>}
            onClick={handleDemoDataset}
          />
        </div>
        <div className="transition-transform duration-200 hover:scale-105 hover:shadow-2xl rounded-2xl border border-gradient5 bg-gradient1/80 p-8 shadow-xl">
          <CTACard
            title="Explore ML Models"
            description="Discover machine learning models and insights for your data."
            icon={<span>🤖</span>}
            onClick={handleExploreML}
          />
        </div>
      </div>
      {/* Show demo charts after clicking CTA */}
      {showDemoCharts && demoData && (
        <div className="max-w-3xl mx-auto my-8 p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">Demo Dataset Visualization</h2>
          <InteractiveCharts demoData={demoData} />
          {/* Demo ML Model Section */}
          <div className="mt-10 p-6 bg-blue-50 rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-2 text-blue-700 text-center">Demo ML Model: Simple Sales Predictor</h3>
            <p className="text-gray-700 mb-4 text-center">This demo model predicts sales value for a new product category using the average of existing categories.</p>
            <div className="flex flex-col items-center">
              <div className="mb-2 text-lg text-blue-900">Model Type: <span className="font-bold">Mean Regressor</span></div>
              <div className="mb-2 text-lg text-blue-900">Predicted Value for "NewCategory": <span className="font-bold">{Math.round((demoData.reduce((sum, row) => sum + (row.Value || 0), 0) / demoData.length) || 0)}</span></div>
              <div className="w-full mt-4">
                {/* Simple visualization: actual vs predicted for each category */}
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="py-2 px-4">Category</th>
                      <th className="py-2 px-4">Actual Value</th>
                      <th className="py-2 px-4">Predicted Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoData.map((row, idx) => (
                      <tr key={row.Category} className={idx % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                        <td className="py-2 px-4">{row.Category}</td>
                        <td className="py-2 px-4">{row.Value}</td>
                        <td className="py-2 px-4">{Math.round((demoData.reduce((sum, r) => sum + (r.Value || 0), 0) / demoData.length) || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ...existing code... */}
    </section>
  );
}
