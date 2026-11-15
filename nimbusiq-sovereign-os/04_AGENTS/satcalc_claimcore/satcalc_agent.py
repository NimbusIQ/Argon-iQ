"""
SATCALC FORENSIC ROOFING AGENT IMPLEMENTATION
NimbusIQ Sovereign OS / ClaimCore Module
"""

import json
import math
import os


class SatcalcAgent:
    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")

    @staticmethod
    def slope_factor(rise: float) -> float:
        return round(math.sqrt(rise ** 2 + 144.0) / 12.0, 4)

    def run_audit(
        self,
        location: str = "McKinney, TX",
        footprint_sqft: float = 2400.0,
        pitch: str = "5/12",
        carrier_paid_squares: float = 21.0,
        waste_pct: float = 0.10,
    ) -> dict:
        try:
            rise = float(pitch.split("/")[0])
        except (ValueError, IndexError):
            rise = 5.0

        multiplier = self.slope_factor(rise)
        derived_area = footprint_sqft * multiplier
        required_squares = round((derived_area * (1.0 + waste_pct)) / 100.0)
        squares_shortfall = max(0.0, required_squares - carrier_paid_squares)
        drip_edge_lf = 400.0
        total_missed = round((squares_shortfall * 325.00) + (drip_edge_lf * 1.805), 2)

        return {
            "audit_summary": {
                "location": location,
                "pitch": pitch,
                "slope_multiplier": multiplier,
                "derived_roof_sqft": round(derived_area, 2),
                "required_squares": required_squares,
                "carrier_paid_squares": carrier_paid_squares,
                "squares_shortfall": squares_shortfall,
            },
            "financial_discrepancy": {
                "missed_amount_dollars": total_missed,
            },
            "omitted_code_line_items": [
                {"item": "Missing 400 LF Drip Edge", "cost": 722.0, "irc_citation": "IRC R905.2.8.5"},
                {"item": f"{int(squares_shortfall)}-Square Shingle Shortfall", "cost": round(squares_shortfall * 325.0, 2), "irc_citation": "IRC R905.2.2"},
            ],
        }


if __name__ == "__main__":
    agent = SatcalcAgent()
    print(json.dumps(agent.run_audit(), indent=2))
