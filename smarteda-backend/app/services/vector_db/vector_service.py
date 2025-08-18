"""
Vector Database Service for SmartEDA Platform.

Provides semantic search capabilities for datasets, analysis results,
and pattern discovery using FAISS and sentence transformers.
"""

import logging
import os
import pickle
from typing import Any, Dict, List, Optional, Union

import numpy as np
import pandas as pd

try:
    import faiss # type: ignore
    from sentence_transformers import SentenceTransformer # type: ignore
except ImportError:
    # These will be available after package installation
    faiss = None  # type: ignore
    SentenceTransformer = None  # type: ignore

from app.settings import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class VectorDBService:
    """
    Vector Database Service for semantic search and similarity matching.

    Features:
    - Dataset similarity search
    - Column pattern matching
    - Analysis result similarity
    - Automated insight discovery
    """

    def __init__(self) -> None:
        """Initialize the vector database service."""
        self.embedding_model: Optional[Any] = None
        self.index: Optional[Any] = None
        self.metadata: Dict[str, List[Any]] = {}
        self.is_initialized = False

        # Ensure vector DB directory exists
        os.makedirs(settings.vector_db_path, exist_ok=True)

    def initialize(self) -> bool:
        """
        Initialize the vector database and embedding model.

        Returns:
            bool: True if initialization successful, False otherwise
        """
        try:
            if SentenceTransformer is None or faiss is None:
                logger.error(
                    "Required packages (faiss-cpu, sentence-transformers) "
                    "not installed"
                )
                return False

            # Load embedding model
            self.embedding_model = SentenceTransformer(
                settings.embedding_model
            )
            logger.info(
                "Loaded embedding model: %s", settings.embedding_model
            )

            # Initialize or load FAISS index
            self._load_or_create_index()

            self.is_initialized = True
            return True

        except (ImportError, OSError, RuntimeError) as e:
            logger.error("Failed to initialize vector database: %s", str(e))
            return False

    def _load_or_create_index(self) -> None:
        """Load existing index or create a new one."""
        index_path = os.path.join(settings.vector_db_path, "faiss_index.bin")
        metadata_path = os.path.join(
            settings.vector_db_path, "metadata.pkl"
        )

        if os.path.exists(index_path) and os.path.exists(metadata_path):
            # Load existing index
            try:
                self.index = faiss.read_index(index_path)  # type: ignore
                with open(metadata_path, 'rb') as f:
                    self.metadata = pickle.load(f)
                logger.info(
                    "Loaded existing index with %d vectors",
                    self.index.ntotal # type: ignore
                )
            except (OSError, pickle.PickleError) as e:
                logger.warning("Failed to load existing index: %s", str(e))
                self._create_new_index()
        else:
            self._create_new_index()

    def _create_new_index(self) -> None:
        """Create a new FAISS index."""
        # Create FAISS index (using IndexFlatIP for cosine similarity)
        self.index = faiss.IndexFlatIP(settings.vector_dimension)  # type: ignore
        self.metadata = {
            'documents': [],
            'dataset_ids': [],
            'document_types': [],
            'timestamps': []
        }
        logger.info("Created new FAISS index")

    def add_dataset_metadata(
        self,
        dataset_id: str,
        df: pd.DataFrame,
        analysis_results: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Add dataset metadata and column information to vector database.

        Args:
            dataset_id: Unique dataset identifier
            df: Pandas DataFrame
            analysis_results: Optional analysis results

        Returns:
            bool: Success status
        """
        if not self.is_initialized:
            if not self.initialize():
                return False

        try:
            documents = []

            # Create embeddings for dataset metadata
            dataset_description = self._create_dataset_description(
                df, analysis_results
            )
            documents.append({ # type: ignore
                'text': dataset_description,
                'type': 'dataset_overview',
                'dataset_id': dataset_id
            })

            # Create embeddings for individual columns
            for column in df.columns:
                column_description = self._create_column_description(
                    df, column
                )
                documents.append({ # type: ignore
                    'text': column_description,
                    'type': 'column_metadata',
                    'dataset_id': dataset_id,
                    'column_name': column
                })

            # Generate embeddings and add to index
            return self._add_documents(documents) # type: ignore

        except (ValueError, KeyError, RuntimeError) as e:
            logger.error("Failed to add dataset metadata: %s", str(e))
            return False

    def search_similar_datasets(
        self,
        query_df: pd.DataFrame,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Find datasets similar to the query dataset.

        Args:
            query_df: Query DataFrame
            top_k: Number of similar datasets to return

        Returns:
            List of similar dataset information
        """
        if not self.is_initialized:
            return []

        try:
            # Create query embedding
            query_description = self._create_dataset_description(query_df)
            query_embedding = self.embedding_model.encode([query_description]) # type: ignore

            # Normalize for cosine similarity
            faiss.normalize_L2(query_embedding)  # type: ignore

            # Search
            scores, indices = self.index.search(query_embedding, top_k) # type: ignore

            results = []
            for i, (score, idx) in enumerate(zip(scores[0], indices[0])):
                if idx != -1 and score > settings.similarity_threshold:
                    results.append({ # type: ignore
                        'dataset_id': self.metadata['dataset_ids'][idx],
                        'similarity_score': float(score),
                        'document_type': self.metadata['document_types'][idx],
                        'rank': i + 1
                    })

            return results # type: ignore

        except (ValueError, KeyError, RuntimeError) as e:
            logger.error("Failed to search similar datasets: %s", str(e))
            return []

    def search_similar_columns(
        self,
        column_name: str,
        column_data: pd.Series,
        top_k: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Find columns similar to the query column.

        Args:
            column_name: Name of the query column
            column_data: Column data (pandas Series)
            top_k: Number of similar columns to return

        Returns:
            List of similar column information
        """
        if not self.is_initialized:
            return []

        try:
            # Create query embedding for column
            column_description = self._create_column_description_from_series(
                column_name, column_data
            )
            query_embedding = self.embedding_model.encode([column_description]) # type: ignore
            faiss.normalize_L2(query_embedding)  # type: ignore

            # Search
            scores, indices = self.index.search(query_embedding, top_k) # type: ignore

            results = []
            for i, (score, idx) in enumerate(zip(scores[0], indices[0])):
                if (idx != -1 and
                        score > settings.similarity_threshold and
                        self.metadata['document_types'][idx] == 'column_metadata'):

                    results.append({ # type: ignore
                        'dataset_id': self.metadata['dataset_ids'][idx],
                        'similarity_score': float(score),
                        'rank': i + 1,
                        'document': self.metadata['documents'][idx]
                    })

            return results # type: ignore

        except (ValueError, KeyError, RuntimeError) as e:
            logger.error("Failed to search similar columns: %s", str(e))
            return []

    def _create_dataset_description(
        self,
        df: pd.DataFrame,
        analysis_results: Optional[Dict[str, Any]] = None
    ) -> str:
        """Create a text description of the dataset for embedding."""
        description_parts = []

        # Basic info
        description_parts.append( # type: ignore
            f"Dataset with {len(df)} rows and {len(df.columns)} columns"
        )

        # Column types
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = df.select_dtypes(
            include=['object']
        ).columns.tolist()

        if numeric_cols:
            numeric_list = ', '.join(numeric_cols[:10])
            description_parts.append(f"Numeric columns: {numeric_list}") # type: ignore
        if categorical_cols:
            categorical_list = ', '.join(categorical_cols[:10])
            description_parts.append( # type: ignore
                f"Categorical columns: {categorical_list}"
            )

        # Add analysis insights if available
        if analysis_results and 'insights' in analysis_results:
            insights = analysis_results['insights']
            description_parts.append(f"Key insights: {insights}") # type: ignore

        return " | ".join(description_parts) # type: ignore

    def _create_column_description(
        self,
        df: pd.DataFrame,
        column: str
    ) -> str:
        """Create a text description of a column for embedding."""
        return self._create_column_description_from_series(column, df[column])

    def _create_column_description_from_series(
        self,
        column_name: str,
        column_data: pd.Series
    ) -> str:
        """Create a text description of a column from Series data."""
        description_parts = [f"Column: {column_name}"]

        # Data type
        description_parts.append(f"Type: {column_data.dtype}")

        # Basic stats
        non_null_count = column_data.notna().sum()
        missing_count = column_data.isna().sum()
        description_parts.append(f"Non-null values: {non_null_count}")
        description_parts.append(f"Missing values: {missing_count}")

        if column_data.dtype in ['int64', 'float64']:
            # Numeric column
            min_val = column_data.min()
            max_val = column_data.max()
            mean_val = column_data.mean()
            description_parts.append(f"Range: {min_val} to {max_val}")
            description_parts.append(f"Mean: {mean_val:.2f}")
        else:
            # Categorical column
            unique_count = column_data.nunique()
            description_parts.append(f"Unique values: {unique_count}")
            if unique_count <= 20:
                top_values = column_data.value_counts().head(5).index.tolist()
                values_str = ', '.join(map(str, top_values))
                description_parts.append(f"Top values: {values_str}")

        return " | ".join(description_parts)

    def _add_documents(self, documents: List[Dict[str, Any]]) -> bool:
        """Add documents to the vector database."""
        try:
            texts = [doc['text'] for doc in documents]
            embeddings = self.embedding_model.encode(texts) # type: ignore

            # Normalize embeddings for cosine similarity
            faiss.normalize_L2(embeddings)  # type: ignore

            # Add to index
            self.index.add(embeddings) # type: ignore

            # Update metadata
            for doc in documents:
                self.metadata['documents'].append(doc['text'])
                self.metadata['dataset_ids'].append(doc['dataset_id'])
                self.metadata['document_types'].append(doc['type'])
                timestamp = pd.Timestamp.now().isoformat()
                self.metadata['timestamps'].append(timestamp)

            # Save index and metadata
            self._save_index()

            logger.info(
                "Added %d documents to vector database", len(documents)
            )
            return True

        except (ValueError, KeyError, RuntimeError) as e:
            logger.error("Failed to add documents: %s", str(e))
            return False

    def _save_index(self) -> None:
        """Save the FAISS index and metadata to disk."""
        try:
            index_path = os.path.join(
                settings.vector_db_path, "faiss_index.bin"
            )
            metadata_path = os.path.join(
                settings.vector_db_path, "metadata.pkl"
            )

            faiss.write_index(self.index, index_path)  # type: ignore
            with open(metadata_path, 'wb') as f:
                pickle.dump(self.metadata, f)

        except (OSError, pickle.PickleError) as e:
            logger.error("Failed to save index: %s", str(e))

    def get_stats(self) -> Dict[str, Union[str, int, Dict[str, int]]]:
        """Get vector database statistics."""
        if not self.is_initialized:
            return {"error": "Vector database not initialized"}

        document_types = self.metadata.get('document_types', [])
        type_counts = {
            doc_type: document_types.count(doc_type)
            for doc_type in set(document_types)
        }

        dataset_ids = self.metadata.get('dataset_ids', [])

        return {
            "total_vectors": self.index.ntotal if self.index else 0,
            "vector_dimension": settings.vector_dimension,
            "embedding_model": settings.embedding_model,
            "datasets_indexed": len(set(dataset_ids)),
            "document_types": type_counts
        }


# Global instance
vector_db_service = VectorDBService()
