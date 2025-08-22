import React from 'react';
import { Line, Scatter, Bar } from 'recharts';
import { ResponsiveContainer, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ScatterChart, BarChart } from 'recharts';

export const ModelPerformanceChart: React.FC<{
  data: Array<{ x: number; actual: number; predicted: number; }>;
  title: string;
}> = ({ data, title }) => {
  return (
    <div className="w-full h-[300px] p-4">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey="x" name="X" />
          <YAxis type="number" dataKey="predicted" name="Y" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          <Scatter name="Data Points" data={data} fill="#8884d8" />
          {/* Perfect prediction line */}
          <Line 
            type="monotone" 
            dataKey="actual" 
            stroke="#82ca9d" 
            dot={false} 
            activeDot={false}
            name="Perfect Prediction"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ClusteringVisualization: React.FC<{
  data: Array<{ x: number; y: number; cluster: number; }>;
  title: string;
}> = ({ data, title }) => {
  return (
    <div className="w-full h-[300px] p-4">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey="x" name="X" />
          <YAxis type="number" dataKey="y" name="Y" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          <Scatter 
            name="Clusters" 
            data={data} 
            fill="#8884d8"
            shape="circle"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export const FeatureImportanceChart: React.FC<{
  data: Array<{ feature: string; importance: number; }>;
  title: string;
}> = ({ data, title }) => {
  return (
    <div className="w-full h-[300px] p-4">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="feature" type="category" />
          <Tooltip />
          <Legend />
          <Bar dataKey="importance" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
