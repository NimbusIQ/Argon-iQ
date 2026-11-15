"""
Wisdom Engine Module for Gemini Coding Agent
Implements Semantic Memory and a lightweight Knowledge Graph.
Instead of just storing chat history, the Wisdom Engine extracts entities, relationships,
and core concepts from interactions to build a self-growing knowledge base.
"""

import json
import os
from datetime import datetime

WISDOM_FILE = "wisdom_graph.json"

class WisdomEngine:
    def __init__(self, storage_path=WISDOM_FILE):
        self.storage_path = storage_path
        self.graph = self._load_graph()

    def _load_graph(self):
        if os.path.exists(self.storage_path):
            with open(self.storage_path, 'r') as f:
                return json.load(f)
        return {"entities": {}, "relationships": []}

    def _save_graph(self):
        with open(self.storage_path, 'w') as f:
            json.dump(self.graph, f, indent=2)

    def add_knowledge(self, subject: str, predicate: str, object_target: str, context: str = ""):
        """Add a triple (subject -> predicate -> object) to the knowledge graph."""
        # Add entities if they don't exist
        if subject not in self.graph["entities"]:
            self.graph["entities"][subject] = {"type": "concept", "first_seen": datetime.now().isoformat()}
        if object_target not in self.graph["entities"]:
            self.graph["entities"][object_target] = {"type": "concept", "first_seen": datetime.now().isoformat()}
            
        # Add relationship
        rel = {
            "subject": subject,
            "predicate": predicate,
            "object": object_target,
            "context": context,
            "timestamp": datetime.now().isoformat()
        }
        self.graph["relationships"].append(rel)
        self._save_graph()

    def query_knowledge(self, entity: str):
        """Retrieve all known relationships for a specific entity."""
        results = []
        for rel in self.graph["relationships"]:
            if rel["subject"].lower() == entity.lower() or rel["object"].lower() == entity.lower():
                results.append(rel)
        return results

    def synthesize_context(self, current_task: str):
        """
        In a full implementation, this would use an LLM to extract entities from the current_task,
        query the graph, and return relevant historical wisdom to inject into the prompt.
        """
        # Simplified placeholder
        if "fastapi" in current_task.lower():
            return self.query_knowledge("FastAPI")
        return []

# Singleton instance
wisdom_instance = WisdomEngine()
