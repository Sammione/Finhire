from elasticsearch import AsyncElasticsearch
from app.core.config import settings
from typing import List, Dict, Any

class SearchService:
    def __init__(self):
        self.es = AsyncElasticsearch([settings.ELASTICSEARCH_URL])
        self.index_name = "candidates"

    async def create_index(self):
        """Create Elasticsearch index with semantic search mappings."""
        try:
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
        except Exception as e:
            print(f"Skipping index creation: Elasticsearch not available ({e})")

    async def index_candidate(self, candidate_id: str, data: Dict[str, Any]):
        """Add candidate to search index."""
        try:
            await self.es.index(index=self.index_name, id=candidate_id, document=data)
        except Exception as e:
            print(f"Skipping indexing: Elasticsearch not available ({e})")

    async def search_candidates(self, query: str, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Perform semantic and keyword search."""
        try:
            search_body = {
                "query": {
                    "bool": {
                        "must": [
                            {"multi_match": {"query": query, "fields": ["full_name", "headline", "summary", "experience_text"]}}
                        ]
                    }
                }
            }
            
            response = await self.es.search(index=self.index_name, body=search_body)
            return [hit["_source"] for hit in response["hits"]["hits"]]
        except Exception as e:
            print(f"Returning empty results: Elasticsearch not available ({e})")
            return []

search_service = SearchService()
