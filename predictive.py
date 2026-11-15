"""
Predictive Intelligence Module for Gemini Coding Agent
Implements Next Best Action (NBA) and predictive code intelligence.
Analyzes the current state of the project and recent edits to suggest the next logical step,
command, or code change before the user even asks.
"""

import os

class PredictiveEngine:
    def __init__(self):
        self.recent_actions = []

    def record_action(self, action: str):
        """Record an action taken by the user or agent."""
        self.recent_actions.append(action)
        # Keep only the last 10 actions
        if len(self.recent_actions) > 10:
            self.recent_actions.pop(0)

    def predict_next_action(self, project_dir: str):
        """
        Analyze project state and recent actions to predict the next logical step.
        """
        suggestions = []
        
        # Simple heuristic-based predictions (can be upgraded to LLM-based)
        if not os.path.exists(project_dir):
            return ["Scaffold a new project structure"]
            
        files = os.listdir(project_dir)
        
        if "package.json" in files and "node_modules" not in files:
            suggestions.append("Run 'npm install' to install dependencies")
            
        if "requirements.txt" in files and not any(f.endswith(".env") for f in files):
            suggestions.append("Create a .env file for environment variables")
            
        if "Dockerfile" in files and len(self.recent_actions) > 0 and "docker" not in self.recent_actions[-1]:
            suggestions.append("Build the Docker image: 'docker build -t myapp .'")
            
        if not suggestions:
            suggestions.append("Write tests for the newly created modules")
            suggestions.append("Commit changes to Git")
            
        return suggestions

# Singleton instance
predictive_instance = PredictiveEngine()
