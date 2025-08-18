import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart3, TrendingUp, PieChart as PieChartIcon, Activity, Target, Award, Brain } from 'lucide-react';

export interface DemoChartProps {
  demoData?: Array<{ Category: string; Value: number }>;
}

export const InteractiveCharts: React.FC<DemoChartProps> = ({ demoData }) => {
  if (demoData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 size={20} /> Demo Dataset Bar Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={demoData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Value" fill="#38bdf8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }
  return null;
};

// EDA Chart Components
export const AgeDistributionChart: React.FC<{ data: any[] }> = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5" />
        Age Distribution
      </CardTitle>
      <CardDescription>
        Distribution of employee ages in the dataset
      </CardDescription>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="ageRange" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export const SalaryExperienceChart: React.FC<{ data: any[] }> = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5" />
        Salary vs Experience
      </CardTitle>
      <CardDescription>
        Relationship between years of experience and salary
      </CardDescription>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="experience" name="Experience (Years)" />
          <YAxis 
            dataKey="salary" 
            name="Salary ($)" 
            tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} 
          />
          <Tooltip 
            formatter={(value: any, name: string) => [
              name === 'salary' ? `$${value.toLocaleString()}` : value,
              name === 'salary' ? 'Salary' : 'Experience'
            ]}
          />
          <Scatter fill="#10b981" />
        </ScatterChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export const DepartmentDistributionChart: React.FC<{ data: any[] }> = ({ data }) => {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          Department Distribution
        </CardTitle>
        <CardDescription>
          Employee distribution across departments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const PerformanceDistributionChart: React.FC<{ data: any[] }> = ({ data }) => {
  const averageCount = data.length > 0 ? Math.round(data.reduce((sum, item) => sum + item.count, 0) / data.length) : 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Performance Score Distribution
        </CardTitle>
        <CardDescription>
          Distribution of employee performance scores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="scoreRange" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <ReferenceLine y={averageCount} stroke="#ef4444" strokeDasharray="5 5" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const SalaryByAgeChart: React.FC<{ data: any[] }> = ({ data }) => (
  <Card className="lg:col-span-2">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5" />
        Average Salary by Age Group
      </CardTitle>
      <CardDescription>
        How salary varies across different age groups
      </CardDescription>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="ageGroup" />
          <YAxis tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} />
          <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Average Salary']} />
          <Line 
            type="monotone" 
            dataKey="averageSalary" 
            stroke="#8b5cf6" 
            strokeWidth={3}
            dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

// ML Chart Components
export const ModelComparisonChart: React.FC<{ data: any[] }> = ({ data }) => (
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
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
          <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
          <Tooltip formatter={(value: any) => [`${(value * 100).toFixed(1)}%`, 'R² Score']} />
          <Bar dataKey="r2Score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export const FeatureImportanceChart: React.FC<{ data: any[]; bestModel: string }> = ({ data, bestModel }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Target className="h-5 w-5" />
        Feature Importance
      </CardTitle>
      <CardDescription>
        Most influential features in the best model ({bestModel})
      </CardDescription>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="horizontal" margin={{ left: 80 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
          <YAxis dataKey="feature" type="category" width={70} />
          <Tooltip formatter={(value: any) => [`${(value * 100).toFixed(1)}%`, 'Importance']} />
          <Bar dataKey="importance" fill="#10b981" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export const MetricsRadarChart: React.FC<{ data: any[] }> = ({ data }) => (
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
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
          <Tooltip formatter={(value: any) => [`${value.toFixed(1)}%`, 'Score']} />
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
);

export const PredictionAccuracyChart: React.FC<{ data: any[] }> = ({ data }) => (
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
        <ScatterChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="actual" name="Actual" domain={[0, 10]} />
          <YAxis dataKey="predicted" name="Predicted" domain={[0, 10]} />
          <Tooltip 
            formatter={(value: any, name: string) => [
              value.toFixed(2),
              name === 'actual' ? 'Actual Value' : 'Predicted Value'
            ]}
          />
          <Scatter fill="#f59e0b" />
          <ReferenceLine 
            x1={0} y1={0} x2={10} y2={10}
            stroke="#ef4444" 
            strokeDasharray="5 5" 
          />
        </ScatterChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export const TrainingTimeChart: React.FC<{ data: any[] }> = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Activity className="h-5 w-5" />
        Training Time Comparison
      </CardTitle>
      <CardDescription>
        Time taken to train each model
      </CardDescription>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
          <YAxis tickFormatter={(value) => `${value}s`} />
          <Tooltip formatter={(value: any) => [`${value.toFixed(2)}s`, 'Training Time']} />
          <Bar dataKey="trainingTime" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);