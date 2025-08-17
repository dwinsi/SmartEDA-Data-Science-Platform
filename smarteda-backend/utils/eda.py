"""
EDA utilities for SmartEDA Data Science Platform.
Provides a function to profile pandas DataFrames with summary statistics, missing values, 
and data types.
"""

import io
import base64
from matplotlib import pyplot as plt
import pandas as pd


def profile_data(df: pd.DataFrame, target_column: str = None, full: bool = False): # type: ignore
	"""
	Comprehensive profiling summary for a pandas DataFrame.
	If target_column is provided, includes class balance, grouped stats, and imbalance visualization.
	If full=True, adds more detailed statistics and visualizations.
	"""
	# Sampling for large datasets
	sample = df.head(10).to_dict(orient='records') # type: ignore

	# Outlier detection (IQR method)
	outliers = {}
	for col in df.select_dtypes(include='number').columns:
		Q1 = df[col].quantile(0.25)
		Q3 = df[col].quantile(0.75)
		IQR = Q3 - Q1
		mask = (df[col] < (Q1 - 1.5 * IQR)) | (df[col] > (Q3 + 1.5 * IQR))
		outliers[col] = int(mask.sum())

	# Unique value counts for categorical columns
	unique_counts = {}
	for col in df.select_dtypes(include='object').columns:
		unique_counts[col] = int(df[col].nunique())

	# Correlation matrix for numeric columns
	corr = df.select_dtypes(include='number').corr().to_dict() # type: ignore

	# Visualizations
	viz = {}
	for col in df.select_dtypes(include='number').columns:
		# Histogram
		fig, ax = plt.subplots() # type: ignore
		df[col].hist(ax=ax, bins=20) # type: ignore
		ax.set_title(f"Histogram of {col}") # type: ignore
		buf = io.BytesIO()
		plt.savefig(buf, format='png') # type: ignore
		plt.close(fig)
		buf.seek(0)
		viz[f"{col}_histogram"] = base64.b64encode(buf.read()).decode('utf-8')

		# Boxplot
		fig, ax = plt.subplots() # type: ignore
		ax.boxplot(df[col].dropna())
		ax.set_title(f"Boxplot of {col}") # type: ignore
		buf = io.BytesIO()
		plt.savefig(buf, format='png') # type: ignore
		plt.close(fig)
		buf.seek(0)
		viz[f"{col}_boxplot"] = base64.b64encode(buf.read()).decode('utf-8')

	result = { # type: ignore
		"shape": tuple(df.shape),
		"columns": list(df.columns),
		"dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
		"missing": df.isnull().sum().to_dict(), # type: ignore
		"describe": df.describe(include='all').to_dict(), # type: ignore
		"outliers": outliers,
		"unique_counts": unique_counts,
		"correlation": corr,
		"sample": sample,
		"visualizations": viz
	}

	# If target_column is specified and exists, add class balance and grouped stats
	if target_column and target_column in df.columns:
		# Class balance
		class_balance = df[target_column].value_counts(dropna=False).to_dict() # type: ignore
		result["class_balance"] = class_balance

		# Grouped statistics
		grouped_stats = df.groupby(target_column).mean(numeric_only=True).to_dict() # type: ignore
		result["grouped_stats"] = grouped_stats

		# Imbalance visualization (bar chart)
		fig, ax = plt.subplots() # type: ignore
		df[target_column].value_counts(dropna=False).plot(kind='bar', ax=ax)
		ax.set_title(f"Class Balance for {target_column}") # type: ignore
		buf = io.BytesIO()
		plt.savefig(buf, format='png') # type: ignore
		plt.close(fig)
		buf.seek(0)
		result["class_balance_plot"] = base64.b64encode(buf.read()).decode('utf-8')

	# Add extra details if full=True
	if full:
		# Pairplot (correlation heatmap)
		import seaborn as sns
		fig, ax = plt.subplots(figsize=(8, 6)) # type: ignore
		sns.heatmap(df.corr(numeric_only=True), annot=True, fmt='.2f', cmap='coolwarm', ax=ax) # type: ignore
		ax.set_title("Correlation Heatmap") # type: ignore
		buf = io.BytesIO()
		plt.savefig(buf, format='png') # type: ignore
		plt.close(fig)
		buf.seek(0)
		result["correlation_heatmap"] = base64.b64encode(buf.read()).decode('utf-8')
		# Add more advanced stats or visualizations as needed
	return result # type: ignore
