"""
Module 11: Global Engineering Search Engine
Provides unified global search across Part Numbers, Mesh IDs, Component Names, Service Steps, Warnings, Manual Pages, Torque Values, Work Orders, and Inspection Notes.
"""

import logging
from typing import List, Dict, Any
from atlasai.domain.models import GlobalSearchResult
from atlasai.engines.parts_cross_reference import PartsCrossReferenceEngine
from atlasai.engines.document_rag import DocumentRAGEngine

logger = logging.getLogger("AtlasAI.GlobalSearch")


class GlobalEngineeringSearchEngine:
    def __init__(self, xref_engine: PartsCrossReferenceEngine, rag_engine: DocumentRAGEngine):
        self.xref_engine = xref_engine
        self.rag_engine = rag_engine

    def search(self, query: str) -> List[GlobalSearchResult]:
        """Performs global search across engineering catalog, CAD meshes, and RAG document chunks."""
        results: List[GlobalSearchResult] = []
        q_lower = query.lower().strip()

        if not q_lower:
            return results

        # 1. Search Parts Cross Reference
        for xref in self.xref_engine.xref_list:
            if (q_lower in xref.part_number.lower() or 
                q_lower in xref.component_name.lower() or 
                q_lower in xref.mesh_id.lower() or 
                q_lower in (xref.work_order_id or "").lower()):
                results.append(GlobalSearchResult(
                    result_id=f"part_{xref.part_number}",
                    title=f"{xref.component_name} ({xref.part_number})",
                    category="Part & CAD Mesh",
                    description=f"Mesh {xref.mesh_id} in {xref.assembly_name}. Manual {xref.manual_section} (Page {xref.manual_page}).",
                    mesh_id=xref.mesh_id,
                    relevance_score=0.98
                ))

        # 2. Search Document RAG Chunks
        chunks = self.rag_engine.retrieve_relevant_chunks(query, top_k=5)
        for chunk in chunks:
            results.append(GlobalSearchResult(
                result_id=chunk.chunk_id,
                title=f"{chunk.title} ({chunk.document_type})",
                category="Document Section",
                description=f"{chunk.text_content[:140]}...",
                mesh_id=None,
                relevance_score=round(chunk.similarity_score, 2)
            ))

        # Sort by relevance score
        results.sort(key=lambda r: r.relevance_score, reverse=True)
        logger.info(f"Global Engineering Search returned {len(results)} matches for query '{query}'.")
        return results
