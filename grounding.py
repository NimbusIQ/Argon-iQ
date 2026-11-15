"""
Grounding Module for Gemini Coding Agent
Leverages the native `google_search` tool in the Gemini Interactions API to provide real-time
web grounding, reducing hallucinations and fetching up-to-date documentation and code snippets.
"""

from google import genai
import os

def init_grounded_client():
    """Initialize a Gemini client configured for Google Search grounding."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable not set.")
    return genai.Client(api_key=api_key)

def query_with_grounding(prompt: str, model_name: str = "gemini-2.5-pro"):
    """
    Query the Gemini Interactions API with Google Search grounding enabled.
    Returns the grounded response and any inline citations.
    """
    client = init_grounded_client()
    
    # Use the Interactions API with the google_search tool
    interaction = client.interactions.create(
        model=model_name,
        input=prompt,
        tools=[{"type": "google_search"}]
    )
    
    output_data = {
        "text": interaction.output_text,
        "citations": []
    }
    
    # Extract citations if available
    for step in interaction.steps:
        if step.type == "model_output":
            for content_block in step.content:
                if content_block.type == "text" and hasattr(content_block, 'annotations'):
                    for annotation in content_block.annotations:
                        if annotation.type == "url_citation":
                            cited_text = content_block.text[annotation.start_index:annotation.end_index]
                            output_data["citations"].append({
                                "title": annotation.title,
                                "url": annotation.url,
                                "cited_text": cited_text
                            })
                            
    return output_data

if __name__ == "__main__":
    # Test the grounding module
    try:
        print("Testing Google Search Grounding...")
        result = query_with_grounding("What is the latest version of React as of 2026?")
        print(f"\nResponse:\n{result['text']}")
        if result['citations']:
            print("\nCitations:")
            for cite in result['citations']:
                print(f"- [{cite['title']}]({cite['url']}) -> \"{cite['cited_text']}\"")
    except Exception as e:
        print(f"Grounding test failed: {e}")
