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

def enrich_citizen_complaint(category, description, ai_detected, ai_confidence, landmark="", latitude=None, longitude=None):
    system_prompt = (
        "You are an AI assistant for a Municipal Smart City Grievance System in Lucknow, India. "
        "Analyze civic complaints and produce structured metadata to help officers prioritize and route them. "
        "Always respond with valid JSON only. No markdown, no extra text."
    )
    loc = f"Location: {landmark}" if landmark else (f"GPS: {latitude:.4f}N, {longitude:.4f}E" if latitude else "Location: Lucknow")
    user_prompt = f"""Civic complaint:
Category: {category}
AI Detection: {ai_detected} (Confidence: {ai_confidence:.1f}%)
{loc}
Description: {description}

Return JSON:
{{"priority":"P0 - Critical"|"P1 - High"|"P2 - Normal"|"P3 - Low","estimated_resolution_days":<int>,"recommended_department":"<dept>","officer_summary":"<2-3 sentence summary>","citizen_message":"<1-2 sentence friendly message>","tags":["<tag>"],"escalation_required":true|false}}

Priority: P0=safety hazard, P1=high impact, P2=standard, P3=minor. JSON only."""
    result = _parse_json(_call_nim(system_prompt, user_prompt, 512))
    if result:
        return result
    dept = "Roads Department" if "road" in category.lower() or "pothole" in category.lower() else "Department of Environment" if "garbage" in category.lower() else "Civic Grievance Cell"
    return {"priority":"P2 - Normal","estimated_resolution_days":7,"recommended_department":dept,"officer_summary":f"Citizen-reported {category} issue with {ai_confidence:.0f}% AI confidence. Requires field inspection.","citizen_message":"Your complaint is registered and will be reviewed within 24 hours. Thank you!","tags":[category.lower().replace(' ','-')],"escalation_required":ai_confidence>85}

def verify_repair_completion(before_description, after_description, worker_notes="", category="Road Repair"):
    system_prompt = (
        "You are a municipal quality-control AI inspector for the Lucknow Smart City platform. "
        "Evaluate if a field worker's repair is satisfactorily completed. Respond with valid JSON only."
    )
    user_prompt = f"""Evaluate repair:
Category: {category}
Before: {before_description}
After: {after_description}
Worker Notes: {worker_notes or 'None'}

Return JSON:
{{"verification_status":"Approved"|"Needs Re-work"|"Partial Completion","confidence_percent":<0-100>,"officer_recommendation":"<recommendation>","quality_score":<1-10>,"issues_found":[],"approved":true|false}}

Approved=quality>=7, Partial=4-6, Needs Re-work=<4. JSON only."""
    result = _parse_json(_call_nim(system_prompt, user_prompt, 384))
    return result or {"verification_status":"Pending Manual Review","confidence_percent":0,"officer_recommendation":"AI verification unavailable. Please manually inspect.","quality_score":0,"issues_found":[],"approved":False}

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
