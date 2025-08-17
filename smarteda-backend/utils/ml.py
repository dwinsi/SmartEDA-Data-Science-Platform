"""
ML utilities for SmartEDA Data Science Platform.
Provides a function to train a simple linear regression model on pandas DataFrames.
"""
import pandas as pd
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import r2_score, accuracy_score

def train_model(df: pd.DataFrame, target_column: str = None, model: str = "linear"): # type: ignore
	"""
	Trains a regression or classification model on the given target column.
	Supports 'linear' (regression) and 'logistic' (classification).
	Returns model metrics, predictions, and error messages if needed.
	"""
	if not target_column or target_column not in df.columns:
		return {"error": "Target column not specified or not found in data."}

	X = df.drop(columns=[target_column])
	y = df[target_column]

	# Use only numeric features for simplicity
	X = X.select_dtypes(include='number') # type: ignore
	if X.shape[1] == 0:
		return {"error": "No numeric features available for modeling."}

	if model == "linear":
		# Regression
		reg = LinearRegression()
		reg.fit(X, y)
		pred = reg.predict(X)
		return {
			"model": "Linear Regression",
			"coef": reg.coef_.tolist(),
			"intercept": reg.intercept_.item(), # type: ignore
			"r2_score": r2_score(y, pred),
			"predictions": pred.tolist()
		}
	elif model == "logistic":
		# Classification
		clf = LogisticRegression(max_iter=1000)
		try:
			clf.fit(X, y)
			pred = clf.predict(X)
			return {
				"model": "Logistic Regression",
				"accuracy": accuracy_score(y, pred),
				"predictions": pred.tolist()
			} # type: ignore
		except ValueError as e:
			return {"error": str(e)}
		except TypeError as e:
			return {"error": str(e)}
	else:
		return {"error": f"Model type '{model}' not supported."}
