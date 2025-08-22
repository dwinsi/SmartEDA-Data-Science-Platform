import React from "react";
import { InteractiveCharts, DemoChartProps } from "./InteractiveCharts";

interface LearnSectionProps {
  demoData?: DemoChartProps["demoData"];
}

export function LearnSection({ demoData }: LearnSectionProps) {
  // Example explanations for ML models
  return (
    <section className="min-h-screen py-16 px-4 bg-gradient-to-br from-gradient2 via-gradient3 to-gradient5">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">Learn About ML Models</h1>
        <p className="text-lg text-gradient1 mb-8">
          Explore how different machine learning models work using our demo dataset. Visualize predictions and understand model concepts interactively.
        </p>
      </div>
      <div className="bg-white/80 rounded-xl shadow-xl p-8 mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-gradient6">Linear Regression</h2>
        <p className="mb-4 text-gray-700">
          Linear Regression is a simple model that predicts a value by fitting a straight line to the data. It is commonly used for regression tasks.
        </p>
        {demoData && <InteractiveCharts demoData={demoData} />}
      </div>
      <div className="bg-white/80 rounded-xl shadow-xl p-8 mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-gradient6">Random Forest</h2>
        <p className="mb-4 text-gray-700">
          Random Forest is an ensemble model that builds multiple decision trees and averages their predictions. It is robust and handles complex data well.
        </p>
        {/* You can add a chart or visualization for Random Forest here using demoData */}
      </div>
      {/* Add more model explanations as needed */}
    </section>
  );
}

export default LearnSection;
