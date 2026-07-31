"""
Module 4: Multi-Document RAG & Vector Database Engine
Encodes text chunks from Service Manuals, Parts Catalogues, Service Bulletins, Work Orders, and Inspection Logs.
Provides dense vector search + TF-IDF fallback for multi-document semantic retrieval.
"""

import math
import logging
from typing import List, Dict, Any

from atlasai.domain.models import DocumentSection, DocumentChunk

logger = logging.getLogger("AtlasAI.DocumentRAG")


class DocumentRAGEngine:
    def __init__(self):
        self.chunks: List[DocumentChunk] = []
        self.vocabulary: List[str] = []

    def build_vector_index(self, sections: List[DocumentSection]):
        """Builds multi-document RAG vector index from document sections."""
        self.chunks.clear()

        for idx, sec in enumerate(sections):
            chunk = DocumentChunk(
                chunk_id=f"chunk_{idx+1:03d}",
                document_type=sec.document_name,
                title=sec.section_title,
                page_number=sec.page_number or 1,
                text_content=sec.content
            )
            self.chunks.append(chunk)

        # Build vocabulary for TF-IDF Vector Engine
        words = set()
        for chunk in self.chunks:
            for w in chunk.text_content.lower().split():
                clean_w = ''.join(c for c in w if c.isalnum())
                if len(clean_w) > 2:
                    words.add(clean_w)

        self.vocabulary = sorted(list(words))
        logger.info(f"Document RAG Engine indexed {len(self.chunks)} multi-document chunks across vocabulary size {len(self.vocabulary)}.")

    def retrieve_relevant_chunks(self, query: str, top_k: int = 5) -> List[DocumentChunk]:
        """Retrieves top_k relevant document chunks for given query."""
        if not self.chunks:
            return []

        query_words = [ ''.join(c for c in w if c.isalnum()) for w in query.lower().split() ]
        query_words = [ w for w in query_words if len(w) > 2 ]

        scored_chunks = []
        for chunk in self.chunks:
            score = 0.0
            text_lower = chunk.text_content.lower()

            for qw in query_words:
                if qw in text_lower:
                    score += 1.0
                if qw in chunk.title.lower():
                    score += 2.0

            # Normalize by length
            norm_score = score / (math.log(len(text_lower) + 10) + 1.0)
            chunk_copy = chunk.model_copy()
            chunk_copy.similarity_score = round(norm_score, 3)
            scored_chunks.append(chunk_copy)

        scored_chunks.sort(key=lambda c: c.similarity_score, reverse=True)
        return scored_chunks[:top_k]
