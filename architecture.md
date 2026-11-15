> **SETUP STATUS — updated 2026-11-14**
> - [x] DONE: Set up Firebase (`google-mpf-u5ao4iqsmytq` bound; tightened all open `allow ... if true` rules to Zero-Trust ABAC & deployed via `DeployRules`; wired `getDocFromServer` connection check & `handleFirestoreError`)
> - [x] DONE: Add file-check catalog (live SHA-256 inventory + canonical & security integrity checks in `src/canonical/fileCheckCatalog.ts` and `server.ts`)
> - [x] DONE: Implement catalog (wired `/api/catalog`, `/api/catalog/verify`, server prompt context digest, and the Conversational Agent Catalog drawer into runtime)

# Gemini Multi-Modal Coding Agent Architecture

This reference outlines the required architecture and directory structure for building the Gemini Coding Agent.

## Core Directory Structure

When scaffolding the agent, use the following structure:

```
gemini_coding_agent/
├── agent.py                 # Main CLI entry point and event loop
├── requirements.txt         # Python dependencies
├── system_prompt.txt        # The master system prompt (from template)
├── README.md                # Setup and usage instructions
└── modules/                 # Capability modules
    ├── __init__.py
    ├── file_writer.py       # Tools for writing files and running shell commands
    ├── scaffolder.py        # Project templates (React, FastAPI, etc.)
    ├── image_input.py       # Handles local images and URLs for vision
    ├── voice_input.py       # Handles audio transcription
    ├── memory.py            # Basic rolling conversation memory
    ├── grounding.py         # Google Search API integration
    ├── ghost.py             # Background daemon thread and logging
    ├── wisdom.py            # JSON-based Knowledge Graph management
    └── predictive.py        # Next Best Action heuristic engine
```

## The Four Intelligence Pillars

### 1. Grounding (`grounding.py`)
- **Purpose**: Connects the agent to real-time web content to eliminate hallucinations.
- **Implementation**: Uses Gemini's native Google Search tool (`tools=[{"type": "google_search"}]`).
- **Output**: Responses must include inline citations with source URLs.

### 2. Ghost Mode (`ghost.py`)
- **Purpose**: An invisible background agent that observes workflows and logs actions.
- **Implementation**: Runs in a `threading.Thread(daemon=True)`. Logs to `ghost_mode.log`.

### 3. Wisdom Engine (`wisdom.py`)
- **Purpose**: A self-growing Knowledge Graph replacing flat chat history.
- **Implementation**: Extracts entities (subject, predicate, object) and saves them to a persistent JSON graph.

### 4. Predictive Intelligence (`predictive.py`)
- **Purpose**: Next Best Action (NBA) suggestions based on project state.
- **Implementation**: Analyzes directory state (e.g., missing `.env`, `node_modules`) and recent actions to suggest the next 2-3 steps.

## Showcase Webpage Requirements

The showcase webpage (`index.html`) must be a single-file, self-contained HTML document that includes:
- **Google MVP Design**: Blue-dominant color palette, glassmorphism, responsive layout.
- **Hero Section**: Animated terminal demo.
- **Four Pillars Grid**: Color-coded cards explaining Grounding, Ghost Mode, Wisdom Engine, and Predictive Intelligence.
- **Architecture Diagram**: Visual flow of inputs → Gemini → Tools → Output.
- **Code Examples**: Tabbed code blocks demonstrating capabilities.
- **Setup Guide**: Instructions for local deployment and AI Studio usage.
