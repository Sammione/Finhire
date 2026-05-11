from elasticsearch import AsyncElasticsearch
from app.core.config import settings
from typing import List, Dict, Any

class SearchService:
    def __init__(self):
        self.es = AsyncElasticsearch([settings.ELASTICSEARCH_URL])
        self.index_name = "candidates"

    async def create_index(self):
        """Create Elasticsearch index with semantic search mappings."""
        if await self.es.indices.exists(index=self.index_name):
            return

        mappings = {
            "mappings": {
                "properties": {
                    "full_name": {"type": "text"},
                    "headline": {"type": "text"},
                    "location": {"type": "keyword"},
                    "skills": {"type": "keyword"},
                    "summary": {"type": "text"},
                    "experience_text": {"type": "text"},
                    "embedding": {
                        "type": "dense_vector",
                        "dims": 384, # all-MiniLM-L6-v2 dimension
                        "index": True,
                        "similarity": "cosine"
                    }
                }
            }
        }
        await self.es.indices.create(index=self.index_name, body=mappings)

    async def index_candidate(self, candidate_id: str, data: Dict[str, Any]):
        """Add candidate to search index."""
        await self.es.index(index=self.index_name, id=candidate_id, document=data)

    async def search_candidates(self, query: str, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Perform semantic and keyword search."""
        # Simple keyword search for now, can be expanded to hybrid semantic search
        search_body = {
            "query": {
                "bool": {
                    "must": [
                        {"multi_match": {"query": query, "fields": ["full_name", "headline", "summary", "experience_text"]}}
                    ]
                }
            }
        }
        
        if filters:
            # Apply filters like location, skills etc.
            pass

        response = await self.es.search(index=self.index_name, body=search_body)
        return [hit["_source"] for hit in response["hits"]["hits"]]

search_service = SearchService()
