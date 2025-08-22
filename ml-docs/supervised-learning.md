# Supervised Learning

## Linear Regression

Linear regression is a fundamental algorithm for predicting a continuous target variable.

### Example Code (Python)
```python
from sklearn.linear_model import LinearRegression
import numpy as np

# Generate sample data
X = np.array([[1], [2], [3], [4], [5]])
y = np.array([2, 4, 6, 8, 10])

# Create and train the model
model = LinearRegression()
model.fit(X, y)

# Make predictions
X_new = np.array([[6]])
y_pred = model.predict(X_new)
print(f"Prediction for X=6: {y_pred[0]}")
```

### Key Concepts
- Feature variables (X) and target variable (y)
- Best-fit line
- Mean Squared Error
- R-squared score

## Logistic Regression

Logistic regression is used for binary classification problems.

### Example Code (Python)
```python
from sklearn.linear_model import LogisticRegression
import numpy as np

# Generate sample data
X = np.array([[1], [2], [3], [4], [5]])
y = np.array([0, 0, 1, 1, 1])

# Create and train the model
model = LogisticRegression()
model.fit(X, y)

# Make predictions
X_new = np.array([[3.5]])
y_pred = model.predict(X_new)
print(f"Prediction for X=3.5: {y_pred[0]}")
```

### Key Concepts
- Probability estimation
- Decision boundary
- Maximum likelihood
- Binary cross-entropy
