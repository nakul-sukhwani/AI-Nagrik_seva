"""
routing_engine.py — Civic Issue Routing Engine with Lucknow 8-Zone & 110-Ward Assignment
-----------------------------------------------------------------------------------------
Smart City | Nagrik-Seva AI
Author: Routing Module (auto-generated via AI assistant)

Description:
    Provides:
    1. Geolocation & reverse-geocode based Ward (1-110) and Zone (1-8) assignment for Lucknow.
    2. O(1) dictionary-based routing of classified civic issue types to the correct municipal
       department and the appropriate field officer for the resolved zone.

    Designed as a pure-Python module with no Flask dependency — fully
    testable in isolation and importable by any backend component.

Public API:
    get_assigned_department(issue_type)  -> str
    get_assigned_officer(department, zone_id) -> dict
    route_issue(issue_type, zone_id=None, lat=None, lng=None, address=None, landmark=None) -> dict
    assign_ward_and_zone(lat, lng, address_text, landmark_text) -> dict
"""

from typing import Optional, Dict, Any
import lucknow_wards

# =====================================================
# DEPARTMENT ROUTING TABLE
# O(1) hash-map lookup — covers 28 civic issue types
# =====================================================

ISSUE_ROUTING: dict[str, str] = {
    # ── Roads & Infrastructure ──────────────────────
    "Pothole":                       "Public Works Department (Roads)",
    "Broken Road":                   "Public Works Department (Roads)",
    "Damaged Footpath":              "Public Works Department (Roads)",
    "Bridge Damage":                 "Public Works Department (Roads)",
    "Road Cave-in":                  "Public Works Department (Roads)",

    # ── Water & Sewage ──────────────────────────────
    "Sewage Overflow":               "Water and Sewage Board",
    "Water Leakage":                 "Water and Sewage Board",
    "Water Logging":                 "Water and Sewage Board",
    "Contaminated Supply":           "Water and Sewage Board",
    "Drain Blockage":                "Water and Sewage Board",

    # ── Waste Management & Sanitation ───────────────
    "Garbage":                       "Waste Management & Sanitation Department",
    "Illegal Land Dumping":          "Waste Management & Sanitation Department",
    "Dead Animal":                   "Waste Management & Sanitation Department",
    "Open Defecation":               "Waste Management & Sanitation Department",
    "Overflowing Dustbin":           "Waste Management & Sanitation Department",

    # ── Electricity ─────────────────────────────────
    "Broken Streetlight":            "Electricity Board",
    "Hanging Wires":                 "Electricity Board",
    "Open Transformer":              "Electricity Board",
    "Power Outage":                  "Electricity Board",
    "Electric Pole Damage":          "Electricity Board",

    # ── Horticulture / Forestry ─────────────────────
    "Fallen Tree":                   "Horticulture / Forestry Department",
    "Park Maintenance":              "Horticulture / Forestry Department",
    "Overgrown Weeds":               "Horticulture / Forestry Department",

    # ── Encroachment & Construction ─────────────────
    "Illegal Encroachment":          "Municipal Corporation (Encroachment Cell)",
    "Unauthorized Construction":     "Municipal Corporation (Encroachment Cell)",

    # ── Traffic ─────────────────────────────────────
    "Abandoned Vehicle":             "Traffic Police Department",
    "Traffic Signal Failure":        "Traffic Police Department",
    "Illegal Parking":               "Traffic Police Department",

    # ── Animal Control ──────────────────────────────
    "Stray Animal Menace":           "Animal Control Department",
    "Aggressive Dogs":               "Animal Control Department",

    # ── Pollution ───────────────────────────────────
    "Noise Pollution":               "Pollution Control Board",
    "Air Pollution":                 "Pollution Control Board",
}

# =====================================================
# FALLBACK DEPARTMENT
# =====================================================

FALLBACK_DEPARTMENT = "General Grievance Cell"

# =====================================================
# ZONE → DEPARTMENT → OFFICER ASSIGNMENT TABLE
# Covers all 8 Administrative Zones in Lucknow Municipal Corporation
# =====================================================

ZONE_OFFICERS: dict[str, dict[str, dict]] = {
    "Zone-1": {
        "Public Works Department (Roads)":          {"officer_id": "OFF-2026-1011", "name": "Arun Verma",      "designation": "Roads Inspector (Central)"},
        "Water and Sewage Board":                   {"officer_id": "OFF-2026-1012", "name": "Sunita Rao",      "designation": "Sewage Engineer (Central)"},
        "Waste Management & Sanitation Department": {"officer_id": "OFF-2026-1013", "name": "Mohan Das",       "designation": "Sanitation Supervisor (Central)"},
        "Electricity Board":                        {"officer_id": "OFF-2026-1014", "name": "Vijay Joshi",     "designation": "Electrical Inspector (Central)"},
        "Horticulture / Forestry Department":       {"officer_id": "OFF-2026-1015", "name": "Rekha Sharma",    "designation": "Horticulture Officer (Central)"},
        "Municipal Corporation (Encroachment Cell)":{"officer_id": "OFF-2026-1016", "name": "Sanjay Tiwari",   "designation": "Encroachment Officer (Central)"},
        "Traffic Police Department":                {"officer_id": "OFF-2026-1017", "name": "Deepak Singh",    "designation": "Traffic Sub-Inspector (Central)"},
        "Animal Control Department":                {"officer_id": "OFF-2026-1018", "name": "Kavita Patel",    "designation": "Animal Control Officer (Central)"},
        "Pollution Control Board":                  {"officer_id": "OFF-2026-1019", "name": "Ravi Kumar",      "designation": "Pollution Inspector (Central)"},
        "General Grievance Cell":                   {"officer_id": "OFF-2026-1010", "name": "Nita Gupta",      "designation": "Grievance Officer (Central)"},
    },
    "Zone-2": {
        "Public Works Department (Roads)":          {"officer_id": "OFF-2026-1021", "name": "Mahesh Patil",    "designation": "Roads Inspector (Old City)"},
        "Water and Sewage Board":                   {"officer_id": "OFF-2026-1022", "name": "Anita Kulkarni",  "designation": "Sewage Engineer (Old City)"},
        "Waste Management & Sanitation Department": {"officer_id": "OFF-2026-1023", "name": "Ramesh Nair",     "designation": "Sanitation Supervisor (Old City)"},
        "Electricity Board":                        {"officer_id": "OFF-2026-1024", "name": "Suresh Menon",    "designation": "Electrical Inspector (Old City)"},
        "Horticulture / Forestry Department":       {"officer_id": "OFF-2026-1025", "name": "Geeta Iyer",      "designation": "Horticulture Officer (Old City)"},
        "Municipal Corporation (Encroachment Cell)":{"officer_id": "OFF-2026-1026", "name": "Ashok Pillai",    "designation": "Encroachment Officer (Old City)"},
        "Traffic Police Department":                {"officer_id": "OFF-2026-1027", "name": "Harish Reddy",    "designation": "Traffic Sub-Inspector (Old City)"},
        "Animal Control Department":                {"officer_id": "OFF-2026-1028", "name": "Smitha Nambiar",  "designation": "Animal Control Officer (Old City)"},
        "Pollution Control Board":                  {"officer_id": "OFF-2026-1029", "name": "Pramod Hegde",    "designation": "Pollution Inspector (Old City)"},
        "General Grievance Cell":                   {"officer_id": "OFF-2026-1020", "name": "Lalitha Bhat",    "designation": "Grievance Officer (Old City)"},
    },
    "Zone-3": {
        "Public Works Department (Roads)":          {"officer_id": "OFF-2026-1031", "name": "Dinesh Chauhan",  "designation": "Roads Inspector (North)"},
        "Water and Sewage Board":                   {"officer_id": "OFF-2026-1032", "name": "Pooja Mishra",    "designation": "Sewage Engineer (North)"},
        "Waste Management & Sanitation Department": {"officer_id": "OFF-2026-1033", "name": "Kishore Yadav",   "designation": "Sanitation Supervisor (North)"},
        "Electricity Board":                        {"officer_id": "OFF-2026-1034", "name": "Alok Srivastava", "designation": "Electrical Inspector (North)"},
        "Horticulture / Forestry Department":       {"officer_id": "OFF-2026-1035", "name": "Usha Tripathi",   "designation": "Horticulture Officer (North)"},
        "Municipal Corporation (Encroachment Cell)":{"officer_id": "OFF-2026-1036", "name": "Vivek Pandey",    "designation": "Encroachment Officer (North)"},
        "Traffic Police Department":                {"officer_id": "OFF-2026-1037", "name": "Narendra Bajpai", "designation": "Traffic Sub-Inspector (North)"},
        "Animal Control Department":                {"officer_id": "OFF-2026-1038", "name": "Seema Awasthi",   "designation": "Animal Control Officer (North)"},
        "Pollution Control Board":                  {"officer_id": "OFF-2026-1039", "name": "Ajay Shukla",     "designation": "Pollution Inspector (North)"},
        "General Grievance Cell":                   {"officer_id": "OFF-2026-1030", "name": "Manju Saxena",    "designation": "Grievance Officer (North)"},
    },
    "Zone-4": {
        # Matches demo officer seed OFF-2026-001 for Zone-4
        "Public Works Department (Roads)":          {"officer_id": "OFF-2026-001",  "name": "Rajesh Kumar",    "designation": "Senior Ward Officer (East)"},
        "Water and Sewage Board":                   {"officer_id": "OFF-2026-1042", "name": "Preethi Nair",    "designation": "Sewage Engineer (East)"},
        "Waste Management & Sanitation Department": {"officer_id": "OFF-2026-1043", "name": "Bharat Lal",      "designation": "Sanitation Supervisor (East)"},
        "Electricity Board":                        {"officer_id": "OFF-2026-1044", "name": "Santosh Dubey",   "designation": "Electrical Inspector (East)"},
        "Horticulture / Forestry Department":       {"officer_id": "OFF-2026-1045", "name": "Madhuri Tiwari",  "designation": "Horticulture Officer (East)"},
        "Municipal Corporation (Encroachment Cell)":{"officer_id": "OFF-2026-1046", "name": "Yogesh Aggarwal", "designation": "Encroachment Officer (East)"},
        "Traffic Police Department":                {"officer_id": "OFF-2026-1047", "name": "Devendra Singh",  "designation": "Traffic Sub-Inspector (East)"},
        "Animal Control Department":                {"officer_id": "OFF-2026-1048", "name": "Kamla Devi",      "designation": "Animal Control Officer (East)"},
        "Pollution Control Board":                  {"officer_id": "OFF-2026-1049", "name": "Ashwani Garg",    "designation": "Pollution Inspector (East)"},
        "General Grievance Cell":                   {"officer_id": "OFF-2026-001",  "name": "Rajesh Kumar",    "designation": "Senior Ward Officer (East)"},
    },
    "Zone-5": {
        "Public Works Department (Roads)":          {"officer_id": "OFF-2026-1051", "name": "Vikram Rathore",  "designation": "Roads Inspector (Alambagh)"},
        "Water and Sewage Board":                   {"officer_id": "OFF-2026-1052", "name": "Shalini Dixit",   "designation": "Sewage Engineer (Alambagh)"},
        "Waste Management & Sanitation Department": {"officer_id": "OFF-2026-1053", "name": "Gopal Prasad",    "designation": "Sanitation Supervisor (Alambagh)"},
        "Electricity Board":                        {"officer_id": "OFF-2026-1054", "name": "Tarun Kapoor",    "designation": "Electrical Inspector (Alambagh)"},
        "Horticulture / Forestry Department":       {"officer_id": "OFF-2026-1055", "name": "Priyanka Sen",    "designation": "Horticulture Officer (Alambagh)"},
        "Municipal Corporation (Encroachment Cell)":{"officer_id": "OFF-2026-1056", "name": "Manoj Bajpayee",  "designation": "Encroachment Officer (Alambagh)"},
        "Traffic Police Department":                {"officer_id": "OFF-2026-1057", "name": "Kuldeep Yadav",   "designation": "Traffic Sub-Inspector (Alambagh)"},
        "Animal Control Department":                {"officer_id": "OFF-2026-1058", "name": "Anjali Mishra",   "designation": "Animal Control Officer (Alambagh)"},
        "Pollution Control Board":                  {"officer_id": "OFF-2026-1059", "name": "Hemant Joshi",    "designation": "Pollution Inspector (Alambagh)"},
        "General Grievance Cell":                   {"officer_id": "OFF-2026-1050", "name": "Sunil Agnihotri", "designation": "Grievance Officer (Alambagh)"},
    },
    "Zone-6": {
        "Public Works Department (Roads)":          {"officer_id": "OFF-2026-1061", "name": "Aman Siddiqui",   "designation": "Roads Inspector (Chowk)"},
        "Water and Sewage Board":                   {"officer_id": "OFF-2026-1062", "name": "Zubair Ahmad",    "designation": "Sewage Engineer (Chowk)"},
        "Waste Management & Sanitation Department": {"officer_id": "OFF-2026-1063", "name": "Firoz Khan",      "designation": "Sanitation Supervisor (Chowk)"},
        "Electricity Board":                        {"officer_id": "OFF-2026-1064", "name": "Neeraj Tandon",   "designation": "Electrical Inspector (Chowk)"},
        "Horticulture / Forestry Department":       {"officer_id": "OFF-2026-1065", "name": "Farhana Naqvi",   "designation": "Horticulture Officer (Chowk)"},
        "Municipal Corporation (Encroachment Cell)":{"officer_id": "OFF-2026-1066", "name": "Imran Hashmi",   "designation": "Encroachment Officer (Chowk)"},
        "Traffic Police Department":                {"officer_id": "OFF-2026-1067", "name": "Bhupendra Pal",   "designation": "Traffic Sub-Inspector (Chowk)"},
        "Animal Control Department":                {"officer_id": "OFF-2026-1068", "name": "Nasreen Bano",    "designation": "Animal Control Officer (Chowk)"},
        "Pollution Control Board":                  {"officer_id": "OFF-2026-1069", "name": "Gaurav Rastogi",  "designation": "Pollution Inspector (Chowk)"},
        "General Grievance Cell":                   {"officer_id": "OFF-2026-1060", "name": "Siddharth Shukla","designation": "Grievance Officer (Chowk)"},
    },
    "Zone-7": {
        "Public Works Department (Roads)":          {"officer_id": "OFF-2026-1071", "name": "Satyendra Nath",  "designation": "Roads Inspector (Indira Nagar)"},
        "Water and Sewage Board":                   {"officer_id": "OFF-2026-1072", "name": "Bhavna Pandey",   "designation": "Sewage Engineer (Indira Nagar)"},
        "Waste Management & Sanitation Department": {"officer_id": "OFF-2026-1073", "name": "Pradeep Rawat",  "designation": "Sanitation Supervisor (Indira Nagar)"},
        "Electricity Board":                        {"officer_id": "OFF-2026-1074", "name": "Amitabh Bose",    "designation": "Electrical Inspector (Indira Nagar)"},
        "Horticulture / Forestry Department":       {"officer_id": "OFF-2026-1075", "name": "Deepika Chandra", "designation": "Horticulture Officer (Indira Nagar)"},
        "Municipal Corporation (Encroachment Cell)":{"officer_id": "OFF-2026-1076", "name": "Kapil Dev Misra", "designation": "Encroachment Officer (Indira Nagar)"},
        "Traffic Police Department":                {"officer_id": "OFF-2026-1077", "name": "Dhiren Mallick",  "designation": "Traffic Sub-Inspector (Indira Nagar)"},
        "Animal Control Department":                {"officer_id": "OFF-2026-1078", "name": "Rashmi Gaur",     "designation": "Animal Control Officer (Indira Nagar)"},
        "Pollution Control Board":                  {"officer_id": "OFF-2026-1079", "name": "Manish Kaushik",  "designation": "Pollution Inspector (Indira Nagar)"},
        "General Grievance Cell":                   {"officer_id": "OFF-2026-1070", "name": "Vandana Gupta",   "designation": "Grievance Officer (Indira Nagar)"},
    },
    "Zone-8": {
        "Public Works Department (Roads)":          {"officer_id": "OFF-2026-1081", "name": "Avinash Pasi",    "designation": "Roads Inspector (Ashiyana)"},
        "Water and Sewage Board":                   {"officer_id": "OFF-2026-1082", "name": "Kritika Saini",   "designation": "Sewage Engineer (Ashiyana)"},
        "Waste Management & Sanitation Department": {"officer_id": "OFF-2026-1083", "name": "Chhote Lal",     "designation": "Sanitation Supervisor (Ashiyana)"},
        "Electricity Board":                        {"officer_id": "OFF-2026-1084", "name": "Rajiv Nandan",    "designation": "Electrical Inspector (Ashiyana)"},
        "Horticulture / Forestry Department":       {"officer_id": "OFF-2026-1085", "name": "Neelam Sonkar",   "designation": "Horticulture Officer (Ashiyana)"},
        "Municipal Corporation (Encroachment Cell)":{"officer_id": "OFF-2026-1086", "name": "Suresh Kashyap",  "designation": "Encroachment Officer (Ashiyana)"},
        "Traffic Police Department":                {"officer_id": "OFF-2026-1087", "name": "Anil Rawat",      "designation": "Traffic Sub-Inspector (Ashiyana)"},
        "Animal Control Department":                {"officer_id": "OFF-2026-1088", "name": "Poonam Gautam",   "designation": "Animal Control Officer (Ashiyana)"},
        "Pollution Control Board":                  {"officer_id": "OFF-2026-1089", "name": "Abhishek Maurya", "designation": "Pollution Inspector (Ashiyana)"},
        "General Grievance Cell":                   {"officer_id": "OFF-2026-1080", "name": "Sarita Jaiswal",  "designation": "Grievance Officer (Ashiyana)"},
    },
}

SUPPORTED_ZONES = list(ZONE_OFFICERS.keys())

def normalize_zone_id(zone_input: Optional[str]) -> str:
    """Normalize any zone string format (e.g., 'Zone 1', 'Zone-1 (East)', '1') to 'Zone-1'."""
    if not zone_input:
        return "Zone-4"
    z_str = str(zone_input).strip()
    for num in range(1, 9):
        if f"zone-{num}" in z_str.lower() or f"zone {num}" in z_str.lower() or z_str == str(num):
            return f"Zone-{num}"
    return "Zone-4"

def get_assigned_department(issue_type: str) -> str:
    """Map a classified issue type tag to its responsible municipal department."""
    return ISSUE_ROUTING.get(issue_type, FALLBACK_DEPARTMENT)

def get_assigned_officer(department: str, zone_id: Optional[str] = None) -> dict:
    """Return the officer assigned to a given department in a specific Lucknow zone."""
    resolved_zone = normalize_zone_id(zone_id)
    zone_map = ZONE_OFFICERS.get(resolved_zone, ZONE_OFFICERS["Zone-4"])
    return zone_map.get(department, zone_map.get("General Grievance Cell", {
        "officer_id": "OFF-2026-001",
        "name": "Rajesh Kumar",
        "designation": "Senior Ward Officer (East)"
    }))

def route_issue(
    issue_type: str,
    zone_id: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    address: Optional[str] = None,
    landmark: Optional[str] = None
) -> dict:
    """
    Full routing pipeline:
    1. If lat/lng or address/landmark are supplied, accurately resolves Lucknow Ward (1-110) & Zone (1-8).
    2. Maps classified issue tag to responsible municipal department.
    3. Selects the appropriate field officer for the resolved zone.
    """
    # Resolve Ward & Zone from geolocating
    ward_zone_info = lucknow_wards.assign_ward_and_zone(
        lat=lat,
        lng=lng,
        address_text=address,
        landmark_text=landmark
    )

    resolved_zone = ward_zone_info["zone_id"] if (lat is not None or address or landmark) else normalize_zone_id(zone_id)
    department = get_assigned_department(issue_type)
    is_fallback = department == FALLBACK_DEPARTMENT
    officer = get_assigned_officer(department, resolved_zone)

    return {
        "issue_type":           issue_type,
        "department":           department,
        "officer_id":           officer["officer_id"],
        "officer_name":         officer["name"],
        "officer_designation":  officer["designation"],
        "zone_id":              resolved_zone,
        "zone_name":            ward_zone_info["zone_name"],
        "zone_no":              ward_zone_info["zone_no"],
        "ward_id":              ward_zone_info["ward_id"],
        "ward_no":              ward_zone_info["ward_no"],
        "ward_name":            ward_zone_info["ward_name"],
        "vidhan_sabha":         ward_zone_info["vidhan_sabha"],
        "resolution_method":    ward_zone_info["resolution_method"],
        "key_localities":       ward_zone_info["key_localities"],
        "is_fallback":          is_fallback,
    }

def get_all_issue_types() -> list[str]:
    """Return a sorted list of all recognised civic issue type tags."""
    return sorted(ISSUE_ROUTING.keys())

def get_all_departments() -> list[str]:
    """Return a deduplicated, sorted list of all department names."""
    return sorted(set(ISSUE_ROUTING.values()))
