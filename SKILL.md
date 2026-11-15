---
name: gemini-coding-agent-builder
description: Guide for building, extending, and showcasing a multi-modal coding agent powered by Gemini 2.5 Pro. Use when the user requests to build a coding agent, a software engineering AI, or an application generator that uses Google Gemini, especially one featuring advanced capabilities like Grounding, Ghost Mode, Wisdom Engine, or Predictive Intelligence.
---

# Gemini Coding Agent Builder

This skill provides the workflow and architectural guidelines for building a production-grade, multi-modal coding agent powered by Google Gemini 2.5 Pro, along with an immersive showcase webpage.

## Core Capabilities

The agent is defined by four advanced intelligence pillars:
1. **Grounding**: Real-time web search integration via Gemini API to ensure accurate, up-to-date code and documentation.
2. **Ghost Mode**: Background observation and logging of user actions for pattern recognition and automation.
3. **Wisdom Engine**: A persistent JSON-based knowledge graph that stores architectural decisions and tech stack preferences.
4. **Predictive Intelligence**: Heuristic and LLM-driven analysis of project state to suggest the Next Best Action (NBA).

## Workflow

When tasked with building or extending the Gemini Coding Agent, follow these steps:

### Step 1: Scaffold the Agent Architecture

Review the expected directory structure and module definitions in the architecture reference.

**Action**: Read `/home/ubuntu/skills/gemini-coding-agent-builder/references/architecture.md`

### Step 2: Generate the Core Modules

Write the Python code for the agent. Ensure you implement the following modules in the `modules/` directory:
- `file_writer.py` & `scaffolder.py`: For creating files and project structures.
- `image_input.py` & `voice_input.py`: For handling multi-modal inputs.
- `memory.py`: For basic session history.
- The Four Pillars: `grounding.py`, `ghost.py`, `wisdom.py`, and `predictive.py`.

*Note: Use your best judgment to implement functional Python code for these modules based on the descriptions in the architecture reference.*

### Step 3: Create the System Prompt

Provide the master system prompt that instructs Gemini on how to utilize its tools and the four pillars.

**Action**: Copy the template from `/home/ubuntu/skills/gemini-coding-agent-builder/templates/system_prompt_template.txt` into `system_prompt.txt` within the project directory.

### Step 4: Build the Showcase Webpage

If requested to showcase the agent, build a single-file `index.html` landing page.

The webpage MUST adhere to Google MVP design standards (blue-dominant, clean, responsive) and include:
- An animated hero section (e.g., a simulated terminal).
- A section detailing the Four Intelligence Pillars.
- An architecture flow diagram.
- Tabbed code examples and setup instructions.

### Step 5: Package and Deliver

Zip the completed agent directory and deliver it to the user along with the showcase webpage (if applicable). Provide clear instructions on how to set the `GEMINI_API_KEY` and run the agent.
