# SmartEDA Data Science Platform - Complete Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Demo Mode](#demo-mode)
5. [Technical Stack](#technical-stack)
6. [Installation & Setup](#installation--setup)
7. [API Documentation](#api-documentation)
8. [Frontend Components](#frontend-components)
9. [Backend Services](#backend-services)
10. [Database Schema](#database-schema)
11. [Development Workflow](#development-workflow)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)
14. [Contributing](#contributing)

---

## 🎯 Project Overview

**SmartEDA** is a comprehensive data science platform that enables users to perform Exploratory Data Analysis (EDA) and Machine Learning on their datasets through an intuitive web interface. The platform is designed for both beginners and experienced data scientists.

### Key Objectives
- **Accessibility**: Make data science tools accessible to non-technical users
- **Efficiency**: Streamline the EDA and ML workflow
- **Education**: Provide insights and explanations for analysis results
- **Scalability**: Support datasets of varying sizes and complexities

### Target Users
- **Data Analysts**: Quick EDA and insights generation
- **Business Users**: Self-service analytics without coding
- **Students**: Learning data science concepts
- **Researchers**: Rapid prototyping and exploration

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React/TS)    │◄──►│   (FastAPI)     │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Components  │ │    │ │ API Routes  │ │    │ │ Collections │ │
│ │ - Upload    │ │    │ │ - Data      │ │    │ │ - Datasets  │ │
│ │ - EDA       │ │    │ │ - ML        │ │    │ │ - Analysis  │ │
│ │ - ML        │ │    │ │ - Analysis  │ │    │ │ - Models    │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │                 │
│ │ State Mgmt  │ │    │ │ Services    │ │    │                 │
│ │ - React     │ │    │ │ - Data      │ │    │                 │
│ │ - Local     │ │    │ │ - ML        │ │    │                 │
│ └─────────────┘ │    │ └─────────────┘ │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Communication Flow

1. **User Interaction**: User uploads data or uses demo mode
2. **Frontend Processing**: React components handle UI state and validation
3. **API Communication**: HTTP requests to FastAPI backend
4. **Data Processing**: Backend services process data and run analysis
5. **Database Operations**: Store/retrieve analysis results and metadata
6. **Response Delivery**: Results sent back to frontend for visualization

---

## ✨ Features

### Core Features

#### 1. **Data Upload & Management**
- **File Support**: CSV, XLSX, JSON formats
- **Drag & Drop Interface**: Intuitive file upload
- **Data Validation**: Automatic format detection and validation
- **Preview**: Quick dataset preview before processing
- **Metadata Extraction**: Automatic dataset information extraction

#### 2. **Exploratory Data Analysis (EDA)**
- **Statistical Summary**: 
  - Descriptive statistics (mean, median, mode, std dev)
  - Data types analysis
  - Missing value detection
  - Outlier identification
- **Visualizations**:
  - Distribution plots (histograms, box plots)
  - Correlation matrices and heatmaps
  - Scatter plots for relationships
  - Bar charts for categorical data
- **Data Quality Assessment**:
  - Missing data patterns
  - Duplicate detection
  - Data consistency checks

#### 3. **Machine Learning**
- **Algorithm Support**:
  - **Regression**: Linear, Polynomial, Random Forest, SVR
  - **Classification**: Logistic, Decision Tree, Random Forest, SVM
  - **Clustering**: K-Means, DBSCAN, Hierarchical
- **Model Evaluation**:
  - Performance metrics (R², Accuracy, F1-Score)
  - Cross-validation results
  - Feature importance analysis
  - Model comparison charts
- **Automated Feature Engineering**:
  - Encoding categorical variables
  - Scaling numerical features
  - Handling missing values

#### 4. **Interactive Dashboards**
- **Real-time Updates**: Dynamic chart updates
- **Filtering**: Interactive data filtering
- **Export Options**: Download results as PDF/PNG
- **Responsive Design**: Works on all device sizes

---

## 🎭 Demo Mode

The platform includes a comprehensive demo mode that showcases all features without requiring data upload or backend connectivity.

### Demo Data Generation

```typescript
// Realistic Employee Dataset (1,000 records)
const demoData = {
  records: 1000,
  fields: {
    employee_id: "EMP_001 to EMP_1000",
    name: "Realistic names from name pools",
    age: "22-65 years (normal distribution)",
    salary: "$30,000-$150,000 (experience correlated)",
    department: "Engineering, Marketing, Sales, HR, Finance",
    performance_score: "1-10 scale (normal distribution)",
    years_experience: "0-40 years (age correlated)"
  },
  correlations: {
    "age ↔ experience": "Strong positive correlation",
    "experience ↔ salary": "Strong positive correlation", 
    "performance ↔ salary": "Moderate positive correlation"
  }
}
```

### Demo Analysis Results

#### EDA Results
- **Dataset Overview**: 1,000 rows × 7 columns
- **Statistical Summary**: Real calculated statistics
- **Missing Values**: 0% (clean dataset)
- **Data Types**: Mixed (numerical, categorical, text)
- **Key Insights**: 
  - Average age: 42.3 years
  - Salary range: $31,245 - $147,892
  - Department distribution: Engineering (35%), Marketing (22%), etc.

#### ML Results
- **Random Forest Regressor**: 78.4% R² score
- **Linear Regression**: 71.2% R² score  
- **Decision Tree**: 65.8% R² score
- **Support Vector Regression**: 69.1% R² score

### Demo User Journey

1. **Landing**: Clean interface with "Demo Data" button
2. **Data Loading**: Instant generation of realistic dataset
3. **Navigation**: Dynamic tabs appear (EDA Dashboard, ML Dashboard)
4. **EDA Analysis**: Automatic statistical analysis and visualizations
5. **ML Training**: Pre-computed model results with performance metrics
6. **Insights**: Guided tour through analysis results

---

## 🛠️ Technical Stack

### Frontend Technology

```json
{
  "framework": "React 18.2.0",
  "language": "TypeScript 5.0",
  "bundler": "Vite 5.0",
  "styling": {
    "primary": "Tailwind CSS 3.4",
    "components": "shadcn/ui",
    "icons": "Lucide React"
  },
  "state_management": "React Hooks (useState, useEffect)",
  "data_visualization": {
    "charts": "Recharts",
    "data_processing": "d3-array, lodash"
  },
  "file_processing": {
    "csv": "PapaParse",
    "excel": "ExcelJS"
  },
  "ui_components": {
    "notifications": "Sonner",
    "forms": "React Hook Form",
    "dialogs": "Radix UI"
  }
}
```

### Backend Technology

```json
{
  "framework": "FastAPI 0.104.1",
  "language": "Python 3.11+",
  "async_runtime": "uvicorn",
  "data_processing": {
    "pandas": "2.1.3",
    "numpy": "1.25.2",
    "scipy": "Statistical analysis"
  },
  "machine_learning": {
    "scikit_learn": "1.3.2",
    "matplotlib": "Plotting",
    "seaborn": "Statistical visualizations"
  },
  "database": {
    "mongodb": "pymongo",
    "orm": "motor (async)"
  },
  "file_handling": {
    "uploads": "python-multipart",
    "validation": "pydantic"
  },
  "security": {
    "cors": "fastapi-cors",
    "validation": "pydantic models"
  }
}
```

### Development Tools

```json
{
  "package_managers": ["npm", "pip"],
  "code_quality": {
    "linting": ["ESLint", "Pylint"],
    "formatting": ["Prettier", "Black"],
    "type_checking": ["TypeScript", "mypy"]
  },
  "testing": {
    "frontend": ["Vitest", "React Testing Library"],
    "backend": ["pytest", "FastAPI TestClient"]
  },
  "dev_servers": {
    "frontend": "Vite Dev Server (HMR)",
    "backend": "uvicorn --reload"
  }
}
```

---

## 🚀 Installation & Setup

### Prerequisites

Ensure you have the following installed:

```bash
# Check versions
node --version    # >= 16.0.0
npm --version     # >= 8.0.0
python --version  # >= 3.11.0
pip --version     # >= 23.0.0
```

### Quick Start

#### 1. Clone Repository

```bash
git clone https://github.com/dwinsi/SmartEDA-Data-Science-Platform.git
cd SmartEDA-Data-Science-Platform
```

#### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access application
open http://localhost:3000
```

#### 3. Backend Setup (Optional - Demo mode works without backend)

```bash
# Navigate to backend
cd smarteda-backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env

# Start backend server
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

#### 4. Database Setup (Optional)

```bash
# Install MongoDB (if using full backend)
# Windows: Download from MongoDB website
# macOS: brew install mongodb
# Linux: apt-get install mongodb

# Start MongoDB service
mongod --dbpath /path/to/data/directory
```

### Environment Configuration

#### Frontend Environment (`.env`)

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_UPLOAD_MAX_SIZE=10485760  # 10MB

# Feature Flags
VITE_ENABLE_DEMO_MODE=true
VITE_ENABLE_BACKEND_FEATURES=false

# Development
VITE_DEV_MODE=true
```

#### Backend Environment (`.env`)

```env
# Database Configuration
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=smarteda_db

# API Configuration
API_HOST=127.0.0.1
API_PORT=8000
DEBUG=true

# File Upload Settings
MAX_UPLOAD_SIZE=10485760  # 10MB
UPLOAD_DIRECTORY=./uploads

# Security
CORS_ORIGINS=["http://localhost:3000"]
SECRET_KEY=your-secret-key-here

# ML Configuration
MAX_TRAINING_TIME=300  # 5 minutes
DEFAULT_CV_FOLDS=5
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Authentication
Currently using simple CORS-based access. Future versions will include JWT authentication.

### Endpoints

#### Data Management

##### Upload Dataset
```http
POST /data/upload
Content-Type: multipart/form-data

Body:
- file: CSV/XLSX file
- description: string (optional)

Response:
{
  "dataset_id": "uuid",
  "filename": "data.csv",
  "row_count": 1000,
  "column_count": 8,
  "columns": ["col1", "col2", ...],
  "data_types": {"col1": "int64", ...},
  "created_at": "2025-08-18T10:30:00Z"
}
```

##### Get Dataset Info
```http
GET /data/{dataset_id}

Response:
{
  "dataset_id": "uuid",
  "metadata": {...},
  "preview": [
    {"col1": "value1", "col2": "value2"},
    ...
  ]
}
```

#### Analysis Endpoints

##### Run EDA Analysis
```http
POST /analysis/eda
Content-Type: application/json

Body:
{
  "dataset_id": "uuid",
  "analysis_type": "full",
  "include_visualizations": true
}

Response:
{
  "analysis_id": "uuid",
  "summary": {
    "total_rows": 1000,
    "total_columns": 8,
    "missing_values": {...},
    "data_types": {...}
  },
  "statistics": {
    "numerical_summary": {...},
    "categorical_summary": {...}
  },
  "correlations": [...],
  "visualizations": [...]
}
```

##### Get Analysis Results
```http
GET /analysis/{analysis_id}

Response:
{
  "analysis_id": "uuid",
  "status": "completed",
  "results": {...},
  "created_at": "2025-08-18T10:30:00Z",
  "completed_at": "2025-08-18T10:32:00Z"
}
```

#### Machine Learning Endpoints

##### Train Models
```http
POST /ml/train
Content-Type: application/json

Body:
{
  "dataset_id": "uuid",
  "target_column": "salary",
  "algorithms": ["linear_regression", "random_forest"],
  "test_size": 0.2,
  "cv_folds": 5
}

Response:
{
  "training_job_id": "uuid",
  "status": "started",
  "estimated_completion": "2025-08-18T10:35:00Z"
}
```

##### Get Model Results
```http
GET /ml/results/{training_job_id}

Response:
{
  "job_id": "uuid",
  "status": "completed",
  "models": [
    {
      "algorithm": "random_forest",
      "score": 0.784,
      "metrics": {
        "r2_score": 0.784,
        "mse": 125.67,
        "mae": 8.92
      },
      "feature_importance": [...]
    }
  ]
}
```

### Error Handling

All endpoints return standard HTTP status codes:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid file format",
    "details": {
      "field": "file",
      "expected": ["csv", "xlsx"],
      "received": "txt"
    }
  }
}
```

Common error codes:
- `400`: Bad Request - Invalid input data
- `404`: Not Found - Resource doesn't exist
- `413`: Payload Too Large - File size exceeded
- `422`: Unprocessable Entity - Validation failed
- `500`: Internal Server Error - Server-side error

---

## 🧩 Frontend Components

### Component Architecture

```
components/
├── ui/                    # Base UI components (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── ...
├── FileUpload.tsx         # Drag & drop file upload
├── EDADashboard.tsx       # EDA results visualization
├── MLDashboard.tsx        # ML model results
├── InteractiveCharts.tsx  # Reusable chart components
├── Header.tsx             # Application header
├── HomeSection.tsx        # Landing page content
└── CTACard.tsx           # Call-to-action cards
```

### Key Components

#### FileUpload Component

```typescript
interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedTypes: string[];
  maxSize: number;
  isLoading: boolean;
}

// Features:
// - Drag & drop support
// - File type validation
// - Size limit enforcement
// - Progress indication
// - Error handling
```

#### EDADashboard Component

```typescript
interface EDADashboardProps {
  dataset: Dataset;
  analysisResults?: AnalysisResults;
  isLoading: boolean;
}

// Features:
// - Statistical summaries
// - Interactive charts
// - Data quality indicators
// - Export functionality
// - Responsive layout
```

#### MLDashboard Component

```typescript
interface MLDashboardProps {
  dataset: Dataset;
  modelResults?: ModelResults[];
  onTrainModels: (config: MLConfig) => void;
}

// Features:
// - Algorithm selection
// - Parameter tuning
// - Model comparison
// - Performance metrics
// - Feature importance
```

### State Management

The application uses React hooks for state management:

```typescript
// App.tsx - Main application state
const [currentView, setCurrentView] = useState<'home' | 'eda' | 'ml'>('home');
const [uploadedDataset, setUploadedDataset] = useState<Dataset | null>(null);
const [isLoading, setIsLoading] = useState(false);

// Demo mode state
const [isDemoMode, setIsDemoMode] = useState(false);
const [demoData, setDemoData] = useState<DemoDataset | null>(null);
```

### Chart Components

Built with Recharts for interactive visualizations:

```typescript
// Histogram Component
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={histogramData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="bin" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="count" fill="#8884d8" />
  </BarChart>
</ResponsiveContainer>

// Correlation Heatmap
<ResponsiveContainer width="100%" height={400}>
  <ScatterChart>
    <XAxis dataKey="x" />
    <YAxis dataKey="y" />
    <ZAxis dataKey="correlation" range={[-1, 1]} />
    <Tooltip />
    <Scatter data={correlationData} fill="#82ca9d" />
  </ScatterChart>
</ResponsiveContainer>
```

---

## 🔧 Backend Services

### Service Architecture

```
app/
├── main.py              # FastAPI application entry
├── config.py           # Configuration management
├── settings.py         # Application settings
├── routes/             # API endpoint definitions
│   ├── data.py         # Data management endpoints
│   ├── analysis.py     # EDA analysis endpoints
│   └── ml.py           # Machine learning endpoints
├── services/           # Business logic layer
│   ├── data_service.py # Data processing service
│   ├── eda_service.py  # EDA analysis service
│   └── ml_service.py   # ML training service
├── models/             # Data models and schemas
│   ├── database.py     # Database models
│   └── schemas.py      # Pydantic schemas
├── database/           # Database connection and operations
│   └── connection.py   # MongoDB connection
└── utils/              # Utility functions
    ├── file_processing.py
    └── validation.py
```

### Core Services

#### DataService

```python
class DataService:
    """Handles dataset operations and transformations"""
    
    async def upload_dataset(self, file: UploadFile) -> Dataset:
        """Upload and process dataset file"""
        
    async def get_dataset(self, dataset_id: str) -> Dataset:
        """Retrieve dataset by ID"""
        
    async def validate_dataset(self, df: pd.DataFrame) -> ValidationResult:
        """Validate dataset quality and structure"""
        
    async def preview_dataset(self, dataset_id: str, rows: int = 10) -> List[Dict]:
        """Get dataset preview"""
```

#### EDAService

```python
class EDAService:
    """Performs exploratory data analysis"""
    
    async def run_analysis(self, dataset_id: str) -> AnalysisResult:
        """Run complete EDA analysis"""
        
    def calculate_statistics(self, df: pd.DataFrame) -> StatsSummary:
        """Calculate descriptive statistics"""
        
    def detect_outliers(self, df: pd.DataFrame) -> OutlierReport:
        """Identify outliers in numerical columns"""
        
    def analyze_correlations(self, df: pd.DataFrame) -> CorrelationMatrix:
        """Calculate correlation matrix"""
        
    def generate_visualizations(self, df: pd.DataFrame) -> List[Visualization]:
        """Create visualization data for frontend"""
```

#### MLService

```python
class MLService:
    """Handles machine learning operations"""
    
    async def train_models(self, config: MLConfig) -> TrainingJob:
        """Train multiple ML models"""
        
    def prepare_features(self, df: pd.DataFrame, target: str) -> Tuple[np.ndarray, np.ndarray]:
        """Feature engineering and preprocessing"""
        
    def train_regression_models(self, X: np.ndarray, y: np.ndarray) -> List[ModelResult]:
        """Train regression algorithms"""
        
    def train_classification_models(self, X: np.ndarray, y: np.ndarray) -> List[ModelResult]:
        """Train classification algorithms"""
        
    def evaluate_model(self, model, X_test: np.ndarray, y_test: np.ndarray) -> ModelMetrics:
        """Evaluate model performance"""
```

### Database Models

```python
# Dataset Model
class Dataset(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    original_filename: str
    file_size: int
    row_count: int
    column_count: int
    columns: List[str]
    data_types: Dict[str, str]
    created_at: datetime
    updated_at: datetime

# Analysis Result Model  
class AnalysisResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    dataset_id: str
    analysis_type: str
    status: AnalysisStatus
    summary: Dict[str, Any]
    statistics: Dict[str, Any]
    visualizations: List[Dict[str, Any]]
    created_at: datetime
    completed_at: Optional[datetime]

# ML Model Result
class MLModelResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    dataset_id: str
    algorithm: str
    target_column: str
    score: float
    metrics: Dict[str, float]
    parameters: Dict[str, Any]
    feature_importance: Optional[List[Dict[str, float]]]
    training_time: float
    created_at: datetime
```

---

## 📊 Database Schema

### MongoDB Collections

#### datasets
```javascript
{
  "_id": ObjectId("..."),
  "id": "uuid-string",
  "filename": "processed_data.csv",
  "original_filename": "user_data.csv", 
  "file_size": 1048576,
  "row_count": 1000,
  "column_count": 8,
  "columns": ["id", "name", "age", "salary", ...],
  "data_types": {
    "id": "int64",
    "name": "object", 
    "age": "int64",
    "salary": "float64"
  },
  "file_path": "/uploads/uuid-filename.csv",
  "metadata": {
    "encoding": "utf-8",
    "separator": ",",
    "has_header": true
  },
  "created_at": ISODate("2025-08-18T10:30:00Z"),
  "updated_at": ISODate("2025-08-18T10:30:00Z")
}
```

#### analysis_results
```javascript
{
  "_id": ObjectId("..."),
  "id": "uuid-string",
  "dataset_id": "dataset-uuid",
  "analysis_type": "eda_full",
  "status": "completed",
  "summary": {
    "total_rows": 1000,
    "total_columns": 8,
    "missing_values_count": 12,
    "duplicate_rows": 3,
    "memory_usage": "64KB"
  },
  "statistics": {
    "numerical_summary": {
      "age": {
        "count": 1000,
        "mean": 42.3,
        "std": 12.8,
        "min": 22,
        "25%": 32,
        "50%": 42,
        "75%": 52,
        "max": 65
      }
    },
    "categorical_summary": {
      "department": {
        "count": 1000,
        "unique": 5,
        "top": "Engineering",
        "freq": 350
      }
    }
  },
  "correlations": [
    {
      "column1": "age",
      "column2": "experience",
      "correlation": 0.89,
      "p_value": 0.001
    }
  ],
  "visualizations": [
    {
      "type": "histogram",
      "column": "age",
      "data": [...],
      "config": {...}
    }
  ],
  "created_at": ISODate("2025-08-18T10:30:00Z"),
  "completed_at": ISODate("2025-08-18T10:32:00Z")
}
```

#### ml_results
```javascript
{
  "_id": ObjectId("..."),
  "id": "uuid-string",
  "dataset_id": "dataset-uuid",
  "training_job_id": "job-uuid",
  "algorithm": "random_forest_regressor",
  "target_column": "salary",
  "features": ["age", "experience", "performance_score"],
  "score": 0.784,
  "metrics": {
    "r2_score": 0.784,
    "mse": 125.67,
    "mae": 8.92,
    "rmse": 11.21
  },
  "parameters": {
    "n_estimators": 100,
    "max_depth": 10,
    "random_state": 42
  },
  "feature_importance": [
    {"feature": "experience", "importance": 0.45},
    {"feature": "age", "importance": 0.32},
    {"feature": "performance_score", "importance": 0.23}
  ],
  "training_config": {
    "test_size": 0.2,
    "cv_folds": 5,
    "preprocessing": {
      "scaling": "standard",
      "encoding": "one_hot"
    }
  },
  "training_time": 2.34,
  "cross_validation_scores": [0.78, 0.82, 0.76, 0.81, 0.79],
  "created_at": ISODate("2025-08-18T10:30:00Z")
}
```

### Indexes

```javascript
// Datasets collection indexes
db.datasets.createIndex({"id": 1}, {unique: true})
db.datasets.createIndex({"created_at": -1})
db.datasets.createIndex({"filename": 1})

// Analysis results collection indexes  
db.analysis_results.createIndex({"id": 1}, {unique: true})
db.analysis_results.createIndex({"dataset_id": 1})
db.analysis_results.createIndex({"status": 1})
db.analysis_results.createIndex({"created_at": -1})

// ML results collection indexes
db.ml_results.createIndex({"id": 1}, {unique: true})
db.ml_results.createIndex({"dataset_id": 1})
db.ml_results.createIndex({"algorithm": 1})
db.ml_results.createIndex({"score": -1})
db.ml_results.createIndex({"created_at": -1})
```

---

## 🔄 Development Workflow

### Git Workflow

```bash
# Feature development
git checkout -b feature/new-ml-algorithm
git add .
git commit -m "feat: add XGBoost algorithm support"
git push origin feature/new-ml-algorithm

# Create pull request
# Code review
# Merge to main branch
```

### Code Quality Standards

#### Frontend (TypeScript)

```json
// .eslintrc.js
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "react-hooks/exhaustive-deps"
  ],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

#### Backend (Python)

```python
# Code formatting with Black
black app/ --line-length 88

# Linting with Pylint
pylint app/ --rcfile=.pylintrc

# Type checking with mypy
mypy app/ --strict
```

### Testing Strategy

#### Frontend Tests

```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { FileUpload } from './FileUpload';

test('should handle file upload', () => {
  const onFileSelect = jest.fn();
  render(<FileUpload onFileSelect={onFileSelect} />);
  
  const input = screen.getByLabelText(/upload file/i);
  const file = new File(['data'], 'test.csv', { type: 'text/csv' });
  
  fireEvent.change(input, { target: { files: [file] } });
  
  expect(onFileSelect).toHaveBeenCalledWith(file);
});
```

#### Backend Tests

```python
# API testing with pytest and FastAPI TestClient
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_upload_dataset():
    with open("test_data.csv", "rb") as f:
        response = client.post(
            "/api/v1/data/upload",
            files={"file": ("test.csv", f, "text/csv")}
        )
    
    assert response.status_code == 200
    data = response.json()
    assert "dataset_id" in data
    assert data["row_count"] > 0
```

### Performance Monitoring

#### Frontend Performance

```typescript
// Performance monitoring with Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

#### Backend Performance

```python
# Performance monitoring with middleware
import time
from fastapi import Request

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

---

## 🚀 Deployment

### Docker Deployment

#### Frontend Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Backend Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 8000

# Start application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  frontend:
    build: 
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    environment:
      - VITE_API_BASE_URL=http://localhost:8000

  backend:
    build:
      context: ./smarteda-backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    depends_on:
      - mongodb
    environment:
      - MONGODB_URL=mongodb://mongodb:27017
      - DATABASE_NAME=smarteda_db
    volumes:
      - ./uploads:/app/uploads

  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=smarteda_db

volumes:
  mongodb_data:
```

### Cloud Deployment (AWS)

#### Infrastructure as Code (Terraform)

```hcl
# main.tf
provider "aws" {
  region = "us-west-2"
}

# ECS Cluster
resource "aws_ecs_cluster" "smarteda_cluster" {
  name = "smarteda-cluster"
}

# Frontend S3 Bucket
resource "aws_s3_bucket" "frontend_bucket" {
  bucket = "smarteda-frontend-${random_id.bucket_suffix.hex}"
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "frontend_distribution" {
  origin {
    domain_name = aws_s3_bucket.frontend_bucket.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.frontend_bucket.id}"
  }
  
  default_cache_behavior {
    target_origin_id = "S3-${aws_s3_bucket.frontend_bucket.id}"
    # ... configuration
  }
}

# Application Load Balancer
resource "aws_lb" "backend_alb" {
  name               = "smarteda-backend-alb"
  internal           = false
  load_balancer_type = "application"
  # ... configuration
}
```

### Environment-Specific Configurations

#### Production Environment

```env
# Frontend (.env.production)
VITE_API_BASE_URL=https://api.smarteda.com
VITE_ENABLE_DEMO_MODE=true
VITE_ENABLE_BACKEND_FEATURES=true
VITE_ANALYTICS_ID=GA_TRACKING_ID

# Backend (.env.production)
MONGODB_URL=mongodb://prod-cluster:27017
DATABASE_NAME=smarteda_prod
DEBUG=false
CORS_ORIGINS=["https://smarteda.com"]
MAX_UPLOAD_SIZE=52428800  # 50MB
```

#### Staging Environment

```env
# Frontend (.env.staging)
VITE_API_BASE_URL=https://api-staging.smarteda.com
VITE_ENABLE_DEMO_MODE=true
VITE_ENABLE_BACKEND_FEATURES=true

# Backend (.env.staging)
MONGODB_URL=mongodb://staging-cluster:27017
DATABASE_NAME=smarteda_staging
DEBUG=true
CORS_ORIGINS=["https://staging.smarteda.com"]
```

---

## 🔧 Troubleshooting

### Common Issues

#### Frontend Issues

##### Issue: "Module not found" errors

```bash
# Solution: Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

##### Issue: Build fails with TypeScript errors

```bash
# Solution: Check TypeScript configuration
npm run type-check
npx tsc --noEmit
```

##### Issue: Charts not rendering

```bash
# Check if chart data is properly formatted
console.log('Chart data:', chartData);

# Verify Recharts is properly installed
npm list recharts
```

#### Backend Issues

##### Issue: "ModuleNotFoundError: No module named 'app'"

```bash
# Solution: Ensure Python path is correct
export PYTHONPATH=$PYTHONPATH:/path/to/smarteda-backend

# Or run from correct directory
cd smarteda-backend
python -m uvicorn app.main:app --reload
```

##### Issue: MongoDB connection failed

```bash
# Check MongoDB service status
# Windows:
net start MongoDB

# macOS:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod

# Verify connection
python -c "import pymongo; client = pymongo.MongoClient('mongodb://localhost:27017'); print('Connected:', client.admin.command('ping'))"
```

##### Issue: File upload fails

```python
# Check file size limits
MAX_UPLOAD_SIZE = 10485760  # 10MB

# Verify upload directory exists and is writable
import os
upload_dir = "./uploads"
if not os.path.exists(upload_dir):
    os.makedirs(upload_dir)
```

#### Database Issues

##### Issue: Slow query performance

```javascript
// Add appropriate indexes
db.datasets.createIndex({"created_at": -1})
db.analysis_results.createIndex({"dataset_id": 1, "status": 1})

// Check query performance
db.datasets.find({"created_at": {$gte: ISODate("2025-01-01")}}).explain("executionStats")
```

##### Issue: Disk space issues

```bash
# Monitor database size
db.stats()

# Clean up old analysis results
db.analysis_results.deleteMany({
  "created_at": {$lt: ISODate("2025-07-01")},
  "status": "completed"
})
```

### Performance Optimization

#### Frontend Optimization

```typescript
// Lazy loading components
const EDADashboard = lazy(() => import('./components/EDADashboard'));
const MLDashboard = lazy(() => import('./components/MLDashboard'));

// Memoize expensive calculations
const chartData = useMemo(() => {
  return processChartData(rawData);
}, [rawData]);

// Debounce user inputs
const debouncedSearch = useCallback(
  debounce((searchTerm: string) => {
    performSearch(searchTerm);
  }, 300),
  []
);
```

#### Backend Optimization

```python
# Use async/await for I/O operations
async def process_large_dataset(dataset_id: str):
    async with aiofiles.open(f"uploads/{dataset_id}.csv", 'rb') as f:
        content = await f.read()
        return await analyze_data_async(content)

# Implement caching
from functools import lru_cache

@lru_cache(maxsize=128)
def calculate_statistics(data_hash: str):
    # Expensive calculation
    return statistical_analysis(data)

# Use background tasks for long-running operations
from fastapi import BackgroundTasks

@router.post("/ml/train")
async def train_models(config: MLConfig, background_tasks: BackgroundTasks):
    background_tasks.add_task(train_models_async, config)
    return {"message": "Training started", "job_id": job_id}
```

### Monitoring and Logging

#### Application Monitoring

```python
# Structured logging
import structlog

logger = structlog.get_logger()

async def upload_dataset(file: UploadFile):
    logger.info("Dataset upload started", 
                filename=file.filename, 
                size=file.size)
    try:
        # Process file
        logger.info("Dataset upload completed", 
                   dataset_id=dataset.id,
                   processing_time=elapsed_time)
    except Exception as e:
        logger.error("Dataset upload failed", 
                    error=str(e), 
                    filename=file.filename)
        raise
```

#### Health Checks

```python
# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "services": {
            "database": await check_database_connection(),
            "storage": check_storage_available()
        }
    }

async def check_database_connection():
    try:
        await database.admin.command('ping')
        return {"status": "connected"}
    except Exception as e:
        return {"status": "disconnected", "error": str(e)}
```

---

## 🤝 Contributing

### Getting Started

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/SmartEDA-Data-Science-Platform.git
   cd SmartEDA-Data-Science-Platform
   ```

2. **Set Up Development Environment**
   ```bash
   # Frontend setup
   npm install
   npm run dev
   
   # Backend setup
   cd smarteda-backend
   python -m venv .venv
   source .venv/bin/activate  # or .venv\Scripts\activate on Windows
   pip install -r requirements.txt
   python -m uvicorn app.main:app --reload
   ```

3. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Development Guidelines

#### Code Style

**Frontend (TypeScript/React)**
- Use functional components with hooks
- Follow React best practices
- Use TypeScript for type safety
- Implement proper error boundaries
- Write descriptive component names

**Backend (Python/FastAPI)**
- Follow PEP 8 guidelines
- Use type hints consistently
- Implement proper error handling
- Write comprehensive docstrings
- Use async/await for I/O operations

#### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/modifications
- `chore`: Maintenance tasks

Examples:
```bash
git commit -m "feat(ml): add XGBoost algorithm support"
git commit -m "fix(upload): handle large file uploads properly"
git commit -m "docs(api): update endpoint documentation"
```

#### Testing Requirements

**Frontend Tests**
```bash
# Run unit tests
npm test

# Run integration tests  
npm run test:integration

# Check test coverage
npm run test:coverage
```

**Backend Tests**
```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_ml_service.py

# Run with coverage
pytest --cov=app tests/
```

### Pull Request Process

1. **Create Quality PR**
   - Clear title and description
   - Reference related issues
   - Include test coverage
   - Update documentation if needed

2. **PR Template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   - [ ] Performance improvement
   
   ## Testing
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] Manual testing completed
   
   ## Screenshots (if applicable)
   
   ## Related Issues
   Closes #123
   ```

3. **Review Process**
   - Code review by maintainer
   - Automated tests pass
   - Documentation updated
   - Merge approval

### Feature Requests

#### How to Submit

1. **Check Existing Issues**: Search for similar requests
2. **Use Feature Template**: Follow the issue template
3. **Provide Context**: Explain use case and benefits
4. **Include Examples**: Mock-ups or examples if applicable

#### Feature Template

```markdown
## Feature Request

### Problem Statement
Clear description of the problem or limitation

### Proposed Solution
Detailed description of the desired feature

### Alternatives Considered
Other approaches you've considered

### Additional Context
Screenshots, examples, or references

### Implementation Notes
Technical considerations or suggestions
```

### Bug Reports

#### Bug Report Template

```markdown
## Bug Report

### Description
Clear description of the bug

### Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

### Expected Behavior
What you expected to happen

### Actual Behavior  
What actually happened

### Environment
- OS: [e.g. Windows 10, macOS 12.1]
- Browser: [e.g. Chrome 96, Firefox 95]
- Node.js: [e.g. 16.13.0]
- Python: [e.g. 3.11.0]

### Screenshots
If applicable, add screenshots

### Additional Context
Any other context about the problem
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **React Team** for the excellent React framework
- **FastAPI Team** for the high-performance Python web framework
- **shadcn/ui** for the beautiful UI components
- **Recharts** for the powerful charting library
- **scikit-learn** for the comprehensive ML algorithms
- **MongoDB** for the flexible document database
- **Vite** for the lightning-fast build tool

---

## 📞 Support

### Getting Help

- **Documentation**: Check this comprehensive guide first
- **Issues**: [GitHub Issues](https://github.com/dwinsi/SmartEDA-Data-Science-Platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/dwinsi/SmartEDA-Data-Science-Platform/discussions)
- **Email**: support@smarteda.com

### Community

- **Discord**: [Join our Discord server](https://discord.gg/smarteda)
- **Twitter**: [@SmartEDA_AI](https://twitter.com/SmartEDA_AI)
- **LinkedIn**: [SmartEDA Company Page](https://linkedin.com/company/smarteda)

### Reporting Security Issues

Please report security vulnerabilities to security@smarteda.com. Do not create public issues for security concerns.

---

**Last Updated**: August 18, 2025  
**Version**: 1.0.0  
**Maintainers**: [@dwinsi](https://github.com/dwinsi)
