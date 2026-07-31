"""
Module 4: Semantic Knowledge Engine
Generates dense semantic vector embeddings for instructions, mesh descriptions, and semantic tags.
Builds a semantic vector index with cosine similarity comparison.
"""

import logging
from typing import List, Dict, Tuple
import numpy as np

from atlasai.domain.models import MeshMetadata, ParsedInstruction
from atlasai.domain.repository import MeshRepository
from atlasai.config.settings import get_settings

logger = logging.getLogger("AtlasAI.SemanticKnowledge")

class SemanticKnowledgeEngine:
    """Vector embedding & similarity index generator with SentenceTransformers and robust TF-IDF fallback."""

    def __init__(self, model_name: str | None = None):
        self.settings = get_settings()
        self.model_name = model_name or self.settings.embedding_model_name
        self._st_model = None
        self._use_st = False
        self._mesh_embeddings: Dict[str, np.ndarray] = {}
        self._vocab: Dict[str, int] = {}
        self._idf: np.ndarray = np.array([])

        self._init_encoder()

    def _init_encoder(self) -> None:
        """Attempts to load sentence-transformers, falling back to TF-IDF vector space if uninstalled."""
        try:
            from sentence_transformers import SentenceTransformer
            self._st_model = SentenceTransformer(self.model_name)
            self._use_st = True
            logger.info(f"Loaded SentenceTransformer model: {self.model_name}")
        except Exception as e:
            logger.warning(f"SentenceTransformers unavailable ({e}). Using advanced internal TF-IDF Vector Engine.")
            self._use_st = False

    def build_index(self, repository: MeshRepository) -> None:
        """Encodes all mesh descriptions and semantic tags into vector representations."""
        mesh_list = repository.list_all()
        if not mesh_list:
            return

        corpus = [f"{m.auto_description} {' '.join(m.semantic_tags)}" for m in mesh_list]

        if self._use_st and self._st_model is not None:
            embeddings = self._st_model.encode(corpus, convert_to_numpy=True, normalize_embeddings=True)
            for m, emb in zip(mesh_list, embeddings):
                self._mesh_embeddings[m.mesh_id] = emb
        else:
            self._build_tfidf_corpus(corpus)
            for m in mesh_list:
                text = f"{m.auto_description} {' '.join(m.semantic_tags)}"
                emb = self._encode_tfidf(text)
                self._mesh_embeddings[m.mesh_id] = emb

        logger.info(f"Semantic Knowledge Engine indexed embeddings for {len(self._mesh_embeddings)} meshes.")

    def get_mesh_embedding(self, mesh_id: str) -> np.ndarray | None:
        return self._mesh_embeddings.get(mesh_id)

    def encode_instruction(self, parsed_instr: ParsedInstruction) -> np.ndarray:
        """Encodes parsed instruction into vector embedding."""
        query_text = (
            f"{parsed_instr.target_object} {parsed_instr.raw_instruction} "
            f"{' '.join(parsed_instr.attribute_hints)} {parsed_instr.position_cue or ''}"
        )

        if self._use_st and self._st_model is not None:
            return self._st_model.encode([query_text], convert_to_numpy=True, normalize_embeddings=True)[0]
        else:
            return self._encode_tfidf(query_text)

    def compute_similarity(self, query_vector: np.ndarray, mesh_id: str) -> float:
        """Computes normalized cosine similarity between query vector and mesh embedding."""
        mesh_vec = self._mesh_embeddings.get(mesh_id)
        if mesh_vec is None:
            return 0.0

        norm_q = np.linalg.norm(query_vector)
        norm_m = np.linalg.norm(mesh_vec)

        if norm_q == 0.0 or norm_m == 0.0:
            return 0.0

        cosine_sim = float(np.dot(query_vector, mesh_vec) / (norm_q * norm_m))
        # Rescale cosine [-1, 1] to [0, 1]
        return max(0.0, min(1.0, float((cosine_sim + 1.0) / 2.0 if not self._use_st else cosine_sim)))

    def _build_tfidf_corpus(self, corpus: List[str]) -> None:
        """Internal TF-IDF vector space builder fallback."""
        words_list = [self._tokenize(doc) for doc in corpus]
        vocab = {}
        for doc_words in words_list:
            for w in doc_words:
                if w not in vocab:
                    vocab[w] = len(vocab)
        self._vocab = vocab
        n_docs = len(corpus)
        n_vocab = len(vocab)

        df = np.zeros(n_vocab)
        for doc_words in words_list:
            unique_w = set(doc_words)
            for w in unique_w:
                df[vocab[w]] += 1

        self._idf = np.log((n_docs + 1.0) / (df + 1.0)) + 1.0

    def _encode_tfidf(self, text: str) -> np.ndarray:
        """Encodes text string into L2-normalized TF-IDF vector."""
        if not self._vocab:
            return np.zeros(1)
        tokens = self._tokenize(text)
        vec = np.zeros(len(self._vocab))
        for t in tokens:
            if t in self._vocab:
                idx = self._vocab[t]
                vec[idx] += 1.0
        vec = vec * self._idf
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec

    def _tokenize(self, text: str) -> List[str]:
        return [w.lower() for w in text.replace("_", " ").split() if len(w) > 1]
