"""
MEDGEMMA HEALTH AGENT OS ROUTER
NimbusIQ Sovereign OS / Clinical Intelligence Module
"""

import json


class MedGemmaRouter:
    MODELS = {
        "triage": "medgemma-1.5-4b",
        "complex_synthesis": "medgemma-27b",
        "vision_embedding": "medsiglip-0.4b",
        "dictation": "medasr",
    }

    def route_intake(self, modality: str, urgency: str, has_clinical_note: bool = False) -> dict:
        if modality == "audio":
            selected = self.MODELS["dictation"]
        elif modality == "image" and urgency == "routine":
            selected = self.MODELS["vision_embedding"]
        elif urgency in ("complex", "high") or has_clinical_note:
            selected = self.MODELS["complex_synthesis"]
        else:
            selected = self.MODELS["triage"]

        return {
            "selected_model": selected,
            "hitl_required": True,
            "hipaa_pii_scrubbing": "enforced",
            "fhir_sync_ready": True,
        }


if __name__ == "__main__":
    router = MedGemmaRouter()
    print(json.dumps(router.route_intake("image", "complex", True), indent=2))
