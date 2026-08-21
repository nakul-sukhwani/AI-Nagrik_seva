"""
nvidia_client.py - NVIDIA NIM AI Integration
"""
import os
import json
import logging
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "").strip().strip('"')
NIM_BASE_URL = "https://integrate.api.nvidia.com/v1"
NIM_MODEL = "meta/llama-3.1-70b-instruct"

_client = None

def _get_client():
    global _client
    if _client is None:
        if not NVIDIA_API_KEY:
            raise RuntimeError("NVIDIA_API_KEY is not set in .env")
        from openai import OpenAI
        _client = OpenAI(base_url=NIM_BASE_URL, api_key=NVIDIA_API_KEY)
    return _client

def _call_nim(system_prompt, user_prompt, max_tokens=1024):
    try:
        client = _get_client()
        response = client.chat.completions.create(
            model=NIM_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3, top_p=0.9, max_tokens=max_tokens, stream=False,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logging.error(f"[NVIDIA NIM] API call failed: {e}")
        return None

def _parse_json(raw):
    if not raw:
        return None
    cleaned = raw.strip()
    if cleaned.startswith(''):
        lines = cleaned.split('\n')
        cleaned = '\n'.join(lines[1:-1]) if len(lines) > 2 else cleaned
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return None

def analyze_civic_issue(category, description, ai_detected, ai_confidence, landmark="", latitude=None, longitude=None):
    system_prompt = (
        "You are a highly strict and objective Municipal Infrastructure Analyst for the 'AI Nagrik' platform.\n"
        "Your job is to analyze the provided image/description of a civic issue and return ONLY a valid JSON object. "
        "Do not hallucinate or guess; rely strictly on visual evidence provided in the text.\n\n"
        "Rules:\n"
        "1. 'Critical' severity is only for immediate threats to life (open deep manholes, live wires, massive sinkholes).\n"
        "2. 'Scale: Major' means it affects a large area or community; 'Minor' means it's a localized small issue.\n"
        "3. If the image/description is not a civic issue, set is_valid_civic_issue to false and ignore other fields."
    )
    loc = f"Location: {landmark}" if landmark else (f"GPS: {latitude:.4f}N, {longitude:.4f}E" if latitude else "Location: Lucknow")
    user_prompt = f"""Civic complaint details (from YOLO & Citizen):
Category: {category}
AI Detection: {ai_detected} (Confidence: {ai_confidence:.1f}%)
{loc}
Description: {description}

Return ONLY valid JSON matching this schema:
{{
  "is_valid_civic_issue": boolean,
  "rejection_reason": "String or null",
  "issue_type": "Road Damage | Water Leakage | Garbage Dump | Streetlight | Drainage | Other",
  "assigned_department": "PWD | Sanitation | Water & Sewage | Electricity | Municipal Admin",
  "severity_level": "Low | Medium | High | Critical",
  "scale": "Major" | "Minor",
  "impact_assessment": {{
    "estimated_affected_people": "Range",
    "impact_reasoning": "Short logic"
  }},
  "required_action": {{
    "materials_needed": ["list"],
    "manpower_estimate": "string"
  }}
}}
"""
    result = _parse_json(_call_nim(system_prompt, user_prompt, 700))
    if result:
        return result
    return {
        "is_valid_civic_issue": True,
        "rejection_reason": None,
        "issue_type": "Other",
        "assigned_department": "Municipal Admin",
        "severity_level": "Medium",
        "scale": "Minor",
        "impact_assessment": {"estimated_affected_people": "10-50", "impact_reasoning": "Unable to determine accurately"},
        "required_action": {"materials_needed": ["Inspection Required"], "manpower_estimate": "1-2"}
    }

def verify_repair_completion(before_description, after_description, worker_notes="", category="Road Repair"):
    system_prompt = (
        "You are a strict Quality Assurance Auditor for public works. "
        "Compare Original Problem and Claimed Solution to verify if the worker actually fixed the issue.\n"
        "Rules:\n"
        "1. If the background landmarks don't match, set same_location to false and action to REJECT.\n"
        "2. If temporary/lazy work is done (e.g., putting loose mud in a pothole instead of tar), mark work_quality as Substandard and action as REJECT.\n"
        "Return ONLY a valid JSON object."
    )
    user_prompt = f"""Evaluate repair:
Category: {category}
Original Problem (Image 1 description): {before_description}
Claimed Solution (Image 2 description): {after_description}
Worker Notes: {worker_notes or 'None'}

Return JSON matching this schema:
{{
  "is_work_completed": boolean,
  "verification_confidence": number,
  "match_analysis": {{
    "same_location": boolean,
    "landmarks_matched": ["list"],
    "tampering_suspected": boolean
  }},
  "work_quality": "Good | Substandard | Incomplete",
  "action": "APPROVE | REJECT | MANUAL_INSPECTION",
  "auditor_remarks": "1-2 lines explaining the decision"
}}
"""
    result = _parse_json(_call_nim(system_prompt, user_prompt, 500))
    if result:
        return result
    return {
        "is_work_completed": False, 
        "verification_confidence": 0, 
        "match_analysis": {"same_location": False, "landmarks_matched": [], "tampering_suspected": False}, 
        "work_quality": "Incomplete", 
        "action": "MANUAL_INSPECTION", 
        "auditor_remarks": "AI verification unavailable. Please manually inspect."
    }

def generate_admin_summary(reports, officers=5, workers=20):
    today = datetime.now().strftime("%d %B %Y")
    total = len(reports)
    pending = sum(1 for r in reports if str(r.get("status","")).lower() in ["pending","submitted"])
    in_progress = sum(1 for r in reports if str(r.get("status","")).lower() in ["in progress","assigned"])
    resolved = sum(1 for r in reports if str(r.get("status","")).lower() in ["resolved","completed","approved"])
    dept_counts = {}
    for r in reports:
        d = r.get("department","Unknown")
        dept_counts[d] = dept_counts.get(d,0)+1
    top_dept = max(dept_counts, key=dept_counts.get) if dept_counts else "N/A"
    system_prompt = (
        "You are an AI administrative assistant for the Lucknow Municipal Corporation Smart City Command Center. "
        "Generate a concise executive daily briefing for the Chief Municipal Officer. Respond with valid JSON only."
    )
    user_prompt = f"""Daily Briefing for {today}:
Stats: {total} total reports | {pending} pending | {in_progress} in-progress | {resolved} resolved
Resolution Rate: {round((resolved/total)*100,1) if total else 0}%
Officers: {officers} | Field Workers: {workers}
Dept Workload: {json.dumps(dept_counts)}
Most Loaded: {top_dept}

Return JSON:
{{"date":"{today}","headline":"<one-line headline>","executive_summary":"<3-4 sentences>","key_highlights":["<h1>","<h2>","<h3>"],"bottlenecks":[],"recommendations":["<r1>","<r2>"],"overall_performance":"Excellent"|"Good"|"Average"|"Poor","alert_level":"Green"|"Yellow"|"Red"}}
JSON only."""
    result = _parse_json(_call_nim(system_prompt, user_prompt, 768))
    return result or {"date":today,"headline":f"City Operations Report - {today}","executive_summary":f"Total {total} reports. {pending} pending, {resolved} resolved today.","key_highlights":[f"Resolution rate: {round((resolved/total)*100,1) if total else 0}%",f"Most active dept: {top_dept}",f"{workers} field workers deployed"],"bottlenecks":[],"recommendations":["Review pending reports","Dispatch workers to high-priority zones"],"overall_performance":"Average","alert_level":"Yellow"}

IS_NVIDIA_ACTIVE = bool(NVIDIA_API_KEY)

if IS_NVIDIA_ACTIVE:
    print(f"[OK] NVIDIA NIM AI is ACTIVE (Model: {NIM_MODEL})")
else:
    print("[WARN] NVIDIA_API_KEY not set — AI enrichment features disabled.")

def enrich_citizen_complaint(category, description, ai_detected, ai_confidence, landmark, latitude, longitude):
    return {
        'citizen_message': 'Your complaint has been registered. Thank you!',
        'escalation_required': False,
        'estimated_resolution_days': 7,
        'officer_summary': '',
        'priority': 'P2 - Normal',
        'tags': []
    }

