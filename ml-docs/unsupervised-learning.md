# Unsupervised Learning

## K-means Clustering

K-means clustering groups similar data points into clusters.

### Example Code (Python)
```python
from sklearn.cluster import KMeans
import numpy as np

# Generate sample data
X = np.array([[1, 2], [1, 4], [1, 0],
              [4, 2], [4, 4], [4, 0]])

# Create and train the model
kmeans = KMeans(n_clusters=2, random_state=42)
kmeans.fit(X)

# Make predictions
X_new = np.array([[0, 0]])
cluster = kmeans.predict(X_new)
print(f"Cluster assignment for point [0, 0]: {cluster[0]}")
```

### Key Concepts
- Centroids
- Cluster assignment
- Inertia
- Elbow method

## Principal Component Analysis (PCA)

PCA is used for dimensionality reduction and feature extraction.

### Example Code (Python)
```python
from sklearn.decomposition import PCA
import numpy as np

# Generate sample data
X = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])

# Create and apply PCA
pca = PCA(n_components=2)
X_reduced = pca.fit_transform(X)

print("Original shape:", X.shape)
print("Reduced shape:", X_reduced.shape)
print("Explained variance ratio:", pca.explained_variance_ratio_)
```

### Key Concepts
- Dimensionality reduction
- Explained variance
- Principal components
- Feature importance
