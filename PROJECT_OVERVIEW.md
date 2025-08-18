# SmartEDA Data Science Platform

A comprehensive, scalable web application for automated Exploratory Data Analysis (EDA) and basic Machine Learning modeling.

## 🚀 Features

### Core Functionality

- **File Upload System**: Drag & drop CSV/Excel files with validation and metadata extraction
- **Automated EDA Engine**: Statistical analysis, correlation detection, outlier identification
- **ML Pipeline**: Multi-algorithm training with classification and regression support
- **Interactive Visualizations**: Heatmaps, distributions, box plots, and more
- **Results Dashboard**: Comprehensive analytics with downloadable reports

### Technical Features

- **RESTful API**: FastAPI backend with automatic API documentation
- **Database Integration**: MongoDB with Beanie ODM for data persistence
- **Modern Frontend**: React with TypeScript and shadcn/ui components
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Real-time Progress**: Live updates during analysis and training
- **Error Handling**: Comprehensive validation and error recovery

## 🛠️ Tech Stack

### Backend

- **FastAPI**: High-performance Python web framework
- **MongoDB**: NoSQL database with Beanie ODM
- **Pandas**: Data manipulation and analysis
- **Scikit-learn**: Machine learning algorithms
- **Matplotlib/Seaborn**: Data visualization
- **Pydantic**: Data validation and settings management

### Frontend

- **React 18**: Modern UI library with hooks
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Beautiful, accessible component library
- **Lucide React**: Modern icon library

### Data Science Stack

- **NumPy**: Numerical computing
- **Pandas**: Data analysis and manipulation
- **Scikit-learn**: Machine learning library
- **Matplotlib**: Plotting library
- **Seaborn**: Statistical data visualization

## 📁 Project Structure

```text
SmartEDA Data Science Platform/
├── smarteda-backend/               # FastAPI Backend
│   ├── app/
│   │   ├── database/              # Database configuration
│   │   ├── models/                # Pydantic models
│   │   ├── routes/                # API endpoints
│   │   │   ├── files.py          # File upload & management
│   │   │   ├── eda.py            # EDA analysis engine
│   │   │   └── ml.py             # ML training pipeline
│   │   ├── services/              # Business logic
│   │   ├── utils/                 # Utility functions
│   │   └── main.py               # FastAPI application
│   └── requirements.txt
├── components/                     # React Components
│   ├── ui/                        # shadcn/ui components
│   ├── FileUpload.tsx            # File upload interface
│   ├── EDADashboard.tsx          # EDA results display
│   ├── MLDashboard.tsx           # ML results display
│   └── ...
├── utils/                         # Frontend utilities
├── styles/                        # CSS styles
├── App.tsx                       # Main React application
├── package.json                  # Node.js dependencies
└── README.md                     # Project documentation
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- MongoDB (optional, runs without persistence)

### Backend Setup

1. Navigate to backend directory:

   ```bash
   cd smarteda-backend
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Start the server:

   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start development server:

   ```bash
   npm run dev
   ```

### Access the Application

- **Frontend**: <http://localhost:3000>
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

## 📊 Usage

### 1. Upload Dataset

- Drag & drop or browse for CSV/Excel files
- Automatic validation and metadata extraction
- View dataset preview with column types

### 2. Run EDA Analysis

- Click "Start EDA" after file upload
- Automated statistical analysis and visualizations
- Interactive dashboard with multiple tabs
- Download comprehensive reports

### 3. Train ML Models

- Select target column for prediction
- Configure train/test split ratio
- Automatic problem type detection (classification/regression)
- Compare multiple algorithm performances

### 4. View Results

- Interactive dashboards for EDA and ML results
- Downloadable JSON reports
- Performance metrics and visualizations
- Model comparison tables

## 🔧 API Endpoints

### File Management

- `POST /api/files/upload` - Upload dataset
- `GET /api/files/datasets` - List uploaded datasets
- `GET /api/files/datasets/{id}` - Get dataset details
- `DELETE /api/files/datasets/{id}` - Delete dataset

### EDA Analysis

- `POST /api/eda/analyze/{dataset_id}` - Start EDA analysis
- `GET /api/eda/results/{analysis_id}` - Get EDA results
- `GET /api/eda/health` - EDA service health check

### Machine Learning

- `POST /api/ml/train/{dataset_id}` - Train ML models
- `GET /api/ml/results/{analysis_id}` - Get ML results
- `GET /api/ml/compare/{dataset_id}` - Compare models
- `GET /api/ml/health` - ML service health check

## 🎯 Key Features

### Automated EDA

- **Statistical Summary**: Descriptive statistics for all columns
- **Correlation Analysis**: Pearson correlation with heatmap visualization
- **Outlier Detection**: Z-score and IQR-based outlier identification
- **Missing Value Analysis**: Comprehensive missing data patterns
- **Distribution Plots**: Histograms and box plots for numerical data

### ML Pipeline

- **Multi-Algorithm Support**:
  - Classification: Logistic Regression, Random Forest, Decision Tree, SVM
  - Regression: Linear Regression, Random Forest, Decision Tree, SVR
- **Automatic Preprocessing**: Feature scaling and missing value handling
- **Cross-Validation**: 5-fold CV for robust performance estimation
- **Feature Importance**: Algorithm-specific feature ranking
- **Performance Metrics**: Comprehensive evaluation metrics

### Data Management

- **File Validation**: Type checking and size limits
- **Metadata Extraction**: Automatic column type detection
- **Storage Management**: Organized file storage with cleanup
- **Analytics Tracking**: Usage statistics and performance monitoring

## 🔒 Production Considerations

### Security

- Input validation and sanitization
- File type and size restrictions
- Error handling without information disclosure
- CORS configuration for cross-origin requests

### Performance

- Asynchronous request handling
- Memory usage monitoring
- Processing time tracking
- Background task support

### Scalability

- Modular architecture with service separation
- Database connection pooling
- Configurable resource limits
- Docker deployment ready

## 📈 Deployment

### Local Development

- Backend: `uvicorn app.main:app --reload`
- Frontend: `npm run dev`

### Production Build

- Frontend: `npm run build`
- Backend: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:

1. Check the API documentation at `/docs`
2. Review the console logs for errors
3. Ensure all dependencies are installed
4. Verify MongoDB connection (if using persistence)

## 🔮 Future Enhancements

- Advanced feature engineering
- Deep learning integration
- Real-time collaboration
- Cloud deployment automation
- Advanced visualization options
- Custom model training parameters
- Data preprocessing pipelines
- Model deployment and serving
