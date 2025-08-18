# API Reference Guide

## SmartEDA Platform API v1.2 - Updated August 2025

### 🚀 Latest Updates

#### Code Quality Improvements

- **PEP8 Compliance**: All backend code now follows Python style guidelines
- **Performance Optimizations**: Improved import organization and task processing
- **Enhanced Error Handling**: Better exception management across all endpoints
- **Async Task Processing**: Upgraded Celery task implementation

### Base Information

- **Base URL**: `http://localhost:8000/api/v1`
- **API Documentation**: `http://localhost:8000/docs` (Swagger UI)
- **Alternative Docs**: `http://localhost:8000/redoc` (ReDoc)
- **Authentication**: None (JWT planned for future versions)
- **Content-Type**: `application/json` for most endpoints
- **File Upload**: `multipart/form-data` for file endpoints
- **Rate Limiting**: Not implemented (planned for production)

### 🔧 Technical Stack

#### Backend Architecture

- **FastAPI**: High-performance async web framework
- **Celery**: Distributed task queue for background processing
- **Pandas**: Data manipulation and analysis
- **Scikit-learn**: Machine learning algorithms
- **Pydantic**: Data validation and serialization

#### Quality Standards

- ✅ **Zero PEP8 violations** across all Python files
- ✅ **Comprehensive type hints** for better IDE support
- ✅ **Async/await patterns** for non-blocking operations
- ✅ **Error handling** with proper exception chaining

---

## Data Management Endpoints

### Upload Dataset

Upload a CSV or XLSX file for analysis.

**Endpoint**: `POST /data/upload`

**Content-Type**: `multipart/form-data`

**Parameters**:

- `file` (required): CSV or XLSX file (max 10MB)
- `description` (optional): Dataset description

**Request Example**:

```bash
curl -X POST \
  http://localhost:8000/api/v1/data/upload \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@dataset.csv' \
  -F 'description=Employee performance data'
```

**Response Example**:

```json
{
  "dataset_id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "dataset_processed.csv",
  "original_filename": "dataset.csv",
  "file_size": 1048576,
  "row_count": 1000,
  "column_count": 8,
  "columns": ["id", "name", "age", "salary", "department", "performance", "experience"],
  "data_types": {
    "id": "int64",
    "name": "object",
    "age": "int64",
    "salary": "float64",
    "department": "object",
    "performance": "float64",
    "experience": "int64"
  },
  "created_at": "2025-08-18T10:30:00Z"
}
```

## Error Responses

```json
// File too large
{
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size exceeds maximum limit of 10MB",
    "details": {
      "max_size": 10485760,
      "received_size": 15728640
    }
  }
}

// Invalid file format
{
  "error": {
    "code": "INVALID_FILE_FORMAT",
    "message": "Unsupported file format",
    "details": {
      "supported_formats": ["csv", "xlsx"],
      "received_format": "txt"
    }
  }
}
```

### Get Dataset Information

Retrieve metadata and preview of an uploaded dataset.

**Endpoint**: `GET /data/{dataset_id}`

**Parameters**:

- `dataset_id` (path): UUID of the dataset
- `preview_rows` (query, optional): Number of preview rows (default: 10)

**Request Example**:

```bash
curl -X GET \
  "http://localhost:8000/api/v1/data/550e8400-e29b-41d4-a716-446655440000?preview_rows=5"
```

**Response Example**:

```json
{
  "dataset_id": "550e8400-e29b-41d4-a716-446655440000",
  "metadata": {
    "filename": "dataset_processed.csv",
    "original_filename": "dataset.csv",
    "file_size": 1048576,
    "row_count": 1000,
    "column_count": 8,
    "columns": ["id", "name", "age", "salary", "department", "performance", "experience"],
    "data_types": {
      "id": "int64",
      "name": "object",
      "age": "int64",
      "salary": "float64",
      "department": "object",
      "performance": "float64",
      "experience": "int64"
    },
    "created_at": "2025-08-18T10:30:00Z"
  },
  "preview": [
    {
      "id": 1,
      "name": "John Doe",
      "age": 28,
      "salary": 55000.0,
      "department": "Engineering",
      "performance": 8.5,
      "experience": 5
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "age": 32,
      "salary": 62000.0,
      "department": "Marketing",
      "performance": 9.1,
      "experience": 8
    }
  ]
}
```

### Delete Dataset

Remove a dataset and all associated analysis results.

**Endpoint**: `DELETE /data/{dataset_id}`

**Parameters**:

- `dataset_id` (path): UUID of the dataset

**Request Example**:

```bash
curl -X DELETE \
  "http://localhost:8000/api/v1/data/550e8400-e29b-41d4-a716-446655440000"
```

**Response Example**:

```json
{
  "message": "Dataset deleted successfully",
  "dataset_id": "550e8400-e29b-41d4-a716-446655440000",
  "deleted_at": "2025-08-18T10:35:00Z"
}
```

---

## Analysis Endpoints

### Run EDA Analysis

Perform comprehensive exploratory data analysis on a dataset.

**Endpoint**: `POST /analysis/eda`

**Content-Type**: `application/json`

**Request Body**:

```json
{
  "dataset_id": "550e8400-e29b-41d4-a716-446655440000",
  "analysis_type": "full",
  "options": {
    "include_visualizations": true,
    "correlation_threshold": 0.5,
    "outlier_detection": true,
    "missing_value_analysis": true
  }
}
```

**Request Example**:

```bash
curl -X POST \
  http://localhost:8000/api/v1/analysis/eda \
  -H 'Content-Type: application/json' \
  -d '{
    "dataset_id": "550e8400-e29b-41d4-a716-446655440000",
    "analysis_type": "full",
    "options": 
    {
      "include_visualizations": true,
      "correlation_threshold": 0.5
    }
  }'
```

**Response Example**:

```json
{
  "analysis_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "dataset_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "summary": {
    "total_rows": 1000,
    "total_columns": 8,
    "missing_values_count": 12,
    "missing_values_percentage": 1.2,
    "duplicate_rows": 3,
    "memory_usage": "64KB",
    "data_quality_score": 95.8
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
        "max": 65,
        "outliers": [21, 66, 67]
      },
      "salary": {
        "count": 1000,
        "mean": 68500.0,
        "std": 18200.0,
        "min": 30000.0,
        "25%": 55000.0,
        "50%": 68000.0,
        "75%": 82000.0,
        "max": 150000.0,
        "outliers": [165000, 175000]
      }
    },
    "categorical_summary": {
      "department": {
        "count": 1000,
        "unique": 5,
        "top": "Engineering",
        "freq": 350,
        "distribution": {
          "Engineering": 350,
          "Marketing": 220,
          "Sales": 180,
          "HR": 150,
          "Finance": 100
        }
      }
    }
  },
  "correlations": [
    {
      "column1": "age",
      "column2": "experience",
      "correlation": 0.89,
      "p_value": 0.001,
      "significance": "highly_significant"
    },
    {
      "column1": "experience",
      "column2": "salary",
      "correlation": 0.76,
      "p_value": 0.001,
      "significance": "highly_significant"
    }
  ],
  "missing_values": {
    "age": 0,
    "salary": 8,
    "performance": 4,
    "total": 12
  },
  "outliers": {
    "age": {
      "count": 3,
      "values": [21, 66, 67],
      "method": "iqr"
    },
    "salary": {
      "count": 2,
      "values": [165000, 175000],
      "method": "iqr"
    }
  },
  "visualizations": [
    {
      "type": "histogram",
      "column": "age",
      "title": "Age Distribution",
      "data": [
        {"bin": "20-25", "count": 45},
        {"bin": "26-30", "count": 120},
        {"bin": "31-35", "count": 180}
      ]
    },
    {
      "type": "correlation_heatmap",
      "title": "Correlation Matrix",
      "data": {
        "age": {"age": 1.0, "experience": 0.89, "salary": 0.56},
        "experience": {"age": 0.89, "experience": 1.0, "salary": 0.76},
        "salary": {"age": 0.56, "experience": 0.76, "salary": 1.0}
      }
    }
  ],
  "created_at": "2025-08-18T10:30:00Z",
  "completed_at": "2025-08-18T10:32:00Z",
  "processing_time": 120.5
}
```

### Get Analysis Results

Retrieve the results of a previously run analysis.

**Endpoint**: `GET /analysis/{analysis_id}`

**Parameters**:

- `analysis_id` (path): UUID of the analysis

**Request Example**:

```bash
curl -X GET \
  "http://localhost:8000/api/v1/analysis/a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

**Response**: Same as EDA analysis response above.

### List Analyses

Get a list of all analyses for a dataset.

**Endpoint**: `GET /analysis/dataset/{dataset_id}`

**Parameters**:

- `dataset_id` (path): UUID of the dataset
- `status` (query, optional): Filter by status (pending, running, completed, failed)
- `limit` (query, optional): Maximum number of results (default: 10)
- `offset` (query, optional): Number of results to skip (default: 0)

**Request Example**:

```bash
curl -X GET \
  "http://localhost:8000/api/v1/analysis/dataset/550e8400-e29b-41d4-a716-446655440000?status=completed&limit=5"
```

**Response Example**:

```json
{
  "analyses": [
    {
      "analysis_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "analysis_type": "eda_full",
      "status": "completed",
      "created_at": "2025-08-18T10:30:00Z",
      "completed_at": "2025-08-18T10:32:00Z",
      "processing_time": 120.5
    }
  ],
  "total": 1,
  "limit": 5,
  "offset": 0
}
```

---

## Machine Learning Endpoints

### Train Models

Train multiple machine learning models on a dataset.

**Endpoint**: `POST /ml/train`

**Content-Type**: `application/json`

**Request Body**:

```json
{
  "dataset_id": "550e8400-e29b-41d4-a716-446655440000",
  "target_column": "salary",
  "feature_columns": ["age", "experience", "performance"],
  "problem_type": "regression",
  "algorithms": [
    "linear_regression",
    "random_forest",
    "decision_tree",
    "svr"
  ],
  "training_config": {
    "test_size": 0.2,
    "cv_folds": 5,
    "random_state": 42,
    "preprocessing": {
      "scale_features": true,
      "handle_missing": "mean",
      "encode_categorical": "one_hot"
    }
  },
  "hyperparameter_tuning": {
    "enabled": true,
    "method": "grid_search",
    "cv_folds": 3
  }
}
```

**Request Example**:

```bash
curl -X POST \
  http://localhost:8000/api/v1/ml/train \
  -H 'Content-Type: application/json' \
  -d '{
    "dataset_id": "550e8400-e29b-41d4-a716-446655440000",
    "target_column": "salary",
    "algorithms": [
      "linear_regression",
      "random_forest"
      ],
    "training_config": 
    {
      "test_size": 0.2,
      "cv_folds": 5
    }
  }'
```

**Response Example**:

```json
{
  "training_job_id": "ml-job-12345678-90ab-cdef-1234-567890abcdef",
  "status": "started",
  "dataset_id": "550e8400-e29b-41d4-a716-446655440000",
  "algorithms": ["linear_regression", "random_forest"],
  "estimated_completion": "2025-08-18T10:35:00Z",
  "started_at": "2025-08-18T10:30:00Z"
}
```

### Get Training Results

Retrieve the results of a machine learning training job.

**Endpoint**: `GET /ml/results/{training_job_id}`

**Parameters**:

- `training_job_id` (path): UUID of the training job

**Request Example**:

```bash
curl -X GET \
  "http://localhost:8000/api/v1/ml/results/ml-job-12345678-90ab-cdef-1234-567890abcdef"
```

**Response Example**:

```json
{
  "training_job_id": "ml-job-12345678-90ab-cdef-1234-567890abcdef",
  "status": "completed",
  "dataset_id": "550e8400-e29b-41d4-a716-446655440000",
  "target_column": "salary",
  "feature_columns": ["age", "experience", "performance"],
  "problem_type": "regression",
  "models": [
    {
      "model_id": "model-rf-12345",
      "algorithm": "random_forest",
      "score": 0.784,
      "metrics": {
        "r2_score": 0.784,
        "mse": 125670000.0,
        "mae": 8920.0,
        "rmse": 11214.0
      },
      "parameters": {
        "n_estimators": 100,
        "max_depth": 10,
        "random_state": 42,
        "min_samples_split": 2,
        "min_samples_leaf": 1
      },
      "feature_importance": [
        {"feature": "experience", "importance": 0.45},
        {"feature": "age", "importance": 0.32},
        {"feature": "performance", "importance": 0.23}
      ],
      "cross_validation_scores": [0.78, 0.82, 0.76, 0.81, 0.79],
      "cv_mean": 0.792,
      "cv_std": 0.023,
      "training_time": 2.34
    },
    {
      "model_id": "model-lr-12346",
      "algorithm": "linear_regression",
      "score": 0.712,
      "metrics": {
        "r2_score": 0.712,
        "mse": 158430000.0,
        "mae": 10150.0,
        "rmse": 12587.0
      },
      "parameters": {
        "fit_intercept": true,
        "normalize": false
      },
      "feature_importance": [
        {"feature": "experience", "coefficient": 1250.5},
        {"feature": "age", "coefficient": 890.2},
        {"feature": "performance", "coefficient": 2100.8}
      ],
      "cross_validation_scores": [0.69, 0.73, 0.71, 0.75, 0.68],
      "cv_mean": 0.712,
      "cv_std": 0.028,
      "training_time": 0.15
    }
  ],
  "best_model": {
    "model_id": "model-rf-12345",
    "algorithm": "random_forest",
    "score": 0.784
  },
  "training_summary": {
    "total_samples": 1000,
    "training_samples": 800,
    "test_samples": 200,
    "feature_count": 3,
    "preprocessing": {
      "scaling": "StandardScaler",
      "missing_values": "mean_imputation",
      "categorical_encoding": "one_hot"
    }
  },
  "started_at": "2025-08-18T10:30:00Z",
  "completed_at": "2025-08-18T10:33:45Z",
  "total_training_time": 225.8
}
```

### Make Predictions

Use a trained model to make predictions on new data.

**Endpoint**: `POST /ml/predict`

**Content-Type**: `application/json`

**Request Body**:

```json
{
  "model_id": "model-rf-12345",
  "input_data": [
    {
      "age": 30,
      "experience": 5,
      "performance": 8.5
    },
    {
      "age": 35,
      "experience": 8,
      "performance": 9.2
    }
  ]
}
```

**Request Example**:

```bash
curl -X POST \
  http://localhost:8000/api/v1/ml/predict \
  -H 'Content-Type: application/json' \
  -d '{
    "model_id": "model-rf-12345",
    "input_data": [
      {
        "age": 30,
        "experience": 5,
        "performance": 8.5
      }
    ]
  }'
```

**Response Example**:

```json
{
  "predictions": [
    {
      "input": {
        "age": 30,
        "experience": 5,
        "performance": 8.5
      },
      "prediction": 67500.0,
      "confidence_interval": {
        "lower": 62000.0,
        "upper": 73000.0
      },
      "prediction_probability": 0.85
    }
  ],
  "model_info": {
    "model_id": "model-rf-12345",
    "algorithm": "random_forest",
    "training_score": 0.784
  },
  "predicted_at": "2025-08-18T10:40:00Z"
}
```

### Get Model Information

Retrieve detailed information about a specific trained model.

**Endpoint**: `GET /ml/models/{model_id}`

**Parameters**:

- `model_id` (path): ID of the model

**Request Example**:

```bash
curl -X GET \
  "http://localhost:8000/api/v1/ml/models/model-rf-12345"
```

**Response**: Returns the model object from the training results above.

---

## Standardized Error Responses

All endpoints use consistent error response format:

### Error Response Schema

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "specific_field",
      "expected": "expected_value",
      "received": "actual_value"
    },
    "timestamp": "2025-08-18T10:30:00Z",
    "request_id": "req-12345678-90ab-cdef"
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource doesn't exist |
| `FILE_TOO_LARGE` | 413 | Uploaded file exceeds size limit |
| `UNSUPPORTED_FORMAT` | 422 | File format not supported |
| `DATASET_PROCESSING_ERROR` | 422 | Error processing dataset |
| `ANALYSIS_FAILED` | 500 | Analysis execution failed |
| `MODEL_TRAINING_FAILED` | 500 | ML model training failed |
| `INTERNAL_ERROR` | 500 | Internal server error |

### Example Error Responses

**Validation Error**:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid target column specified",
    "details": {
      "field": "target_column",
      "expected": "one of: ['age', 'salary', 'performance']",
      "received": "invalid_column"
    },
    "timestamp": "2025-08-18T10:30:00Z"
  }
}
```

**Resource Not Found**:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Dataset not found",
    "details": {
      "resource_type": "dataset",
      "resource_id": "invalid-uuid"
    },
    "timestamp": "2025-08-18T10:30:00Z"
  }
}
```

**Processing Error**:

```json
{
  "error": {
    "code": "DATASET_PROCESSING_ERROR",
    "message": "Unable to parse CSV file",
    "details": {
      "line": 45,
      "column": "salary",
      "issue": "non-numeric value in numeric column"
    },
    "timestamp": "2025-08-18T10:30:00Z"
  }
}
```

---

## Rate Limiting (Future Implementation)

When implemented, rate limiting will follow these patterns:

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1629814800
Retry-After: 60

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 60 seconds.",
    "details": {
      "limit": 100,
      "window": "1 hour",
      "reset_at": "2025-08-18T11:00:00Z"
    }
  }
}
```

---

## Webhooks (Future Implementation)

For long-running operations, webhooks will be available:

**Webhook Registration**:

```json
POST /webhooks
{
  "url": "https://your-app.com/webhook",
  "events": ["analysis.completed", "training.completed"],
  "secret": "your-webhook-secret"
}
```

**Webhook Payload**:

```json
{
  "event": "training.completed",
  "data": {
    "training_job_id": "ml-job-12345678-90ab-cdef-1234-567890abcdef",
    "status": "completed",
    "best_model_score": 0.784
  },
  "timestamp": "2025-08-18T10:35:00Z"
}
```
