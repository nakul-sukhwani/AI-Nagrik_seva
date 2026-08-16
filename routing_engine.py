"""
routing_engine.py — Civic Issue Routing Engine
-----------------------------------------------
Smart City | Nagrik-Seva AI
Author: Routing Module (auto-generated via AI assistant)

Description:
    Provides O(1) dictionary-based routing of classified civic issue types
    to the correct municipal department and the appropriate field officer
    for a given zone.

    Designed as a pure-Python module with no Flask dependency — fully
    testable in isolation and importable by any backend component.

Public API:
    get_assigned_department(issue_type)  -> str
    get_assigned_officer(department, zone_id) -> dict
    route_issue(issue_type, zone_id)    -> dict
"""

from typing import Optional

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
# Simulates officer assignment without a live DB query
# in the routing step. The officer_id strings correspond
# to real rows in the officers table.
# =====================================================

ZONE_OFFICERS: dict[str, dict[str, dict]] = {
    "Zone-1 (East)": {
        "Public Works Department (Roads)":          {"officer_id": "OFF-2026-1011", "name": "Arun Verma",      "designation": "Roads Inspector"},
        "Water and Sewage Board":                   {"officer_id": "OFF-2026-1012", "name": "Sunita Rao",      "designation": "Sewage Engineer"},
        "Waste Management & Sanitation Department": {"officer_id": "OFF-2026-1013", "name": "Mohan Das",       "designation": "Sanitation Supervisor"},
        "Electricity Board":                        {"officer_id": "OFF-2026-1014", "name": "Vijay Joshi",     "designation": "Electrical Inspector"},
        "Horticulture / Forestry Department":       {"officer_id": "OFF-2026-1015", "name": "Rekha Sharma",    "designation": "Horticulture Officer"},
        "Municipal Corporation (Encroachment Cell)":{"officer_id": "OFF-2026-1016", "name": "Sanjay Tiwari",   "designation": "Encroachment Officer"},
        "Traffic Police Department":                {"officer_id": "OFF-2026-1017", "name": "Deepak Singh",    "designation": "Traffic Sub-Inspector"},
        "Animal Control Department":                {"officer_id": "OFF-2026-1018", "name": "Kavita Patel",    "designation": "Animal Control Officer"},
        "Pollution Control Board":                  {"officer_id": "OFF-2026-1019", "name": "Ravi Kumar",      "designation": "Pollution Inspector"},
        "General Grievance Cell":                   {"officer_id": "OFF-2026-1010", "name": "Nita Gupta",      "designation": "Grievance Officer"},
    },
    "Zone-2 (West)": {
        "Public Works Department (Roads)":          {"officer_id": "OFF-2026-1021", "name": "Mahesh Patil",    "designation": "Roads Inspector"},
        "Water and Sewage Board":                   {"officer_id": "OFF-2026-1022", "name": "Anita Kulkarni",  "designation": "Sewage Engineer"},
        "Waste Management & Sanitation Department": {"officer_id": "OFF-2026-1023", "name": "Ramesh Nair",     "designation": "Sanitation Supervisor"},
        "Electricity Board":                        {"officer_id": "OFF-2026-1024", "name": "Suresh Menon",    "designation": "Electrical Inspector"},
        "Horticulture / Forestry Department":       {"officer_id": "OFF-2026-1025", "name": "Geeta Iyer",      "designation": "Horticulture Officer"},
        "Municipal Corporation (Encroachment Cell)":{"officer_id": "OFF-2026-1026", "name": "Ashok Pillai",    "designation": "Encroachment Officer"},
        "Traffic Police Department":                {"officer_id": "OFF-2026-1027", "name": "Harish Reddy",    "designation": "Traffic Sub-Inspector"},
        "Animal Control Department":                {"officer_id": "OFF-2026-1028", "name": "Smitha Nambiar",  "designation": "Animal Control Officer"},
        "Pollution Control Board":                  {"officer_id": "OFF-2026-1029", "name": "Pramod Hegde",    "designation": "Pollution Inspector"},
        "General Grievance Cell":                   {"officer_id": "OFF-2026-1020", "name": "Lalitha Bhat",    "designation": "Grievance Officer"},
    },
    "Zone-3 (South)": {
        "Public Works Department (Roads)":          {"officer_id": "OFF-2026-1031", "name": "Dinesh Chauhan",  "designation": "Roads Inspector"},
        "Water and Sewage Board":                   {"officer_id": "OFF-2026-1032", "name": "Pooja Mishra",    "designation": "Sewage Engineer"},
        "Waste Management & Sanitation Department": {"officer_id": "OFF-2026-1033", "name": "Kishore Yadav",   "designation": "Sanitation Supervisor"},
        "Electricity Board":                        {"officer_id": "OFF-2026-1034", "name": "Alok Srivastava", "designation": "Electrical Inspector"},
        "Horticulture / Forestry Department":       {"officer_id": "OFF-2026-1035", "name": "Usha Tripathi",   "designation": "Horticulture Officer"},
        "Municipal Corporation (Encroachment Cell)":{"officer_id": "OFF-2026-1036", "name": "Vivek Pandey",    "designation": "Encroachment Officer"},
        "Traffic Police Department":                {"officer_id": "OFF-2026-1037", "name": "Narendra Bajpai", "designation": "Traffic Sub-Inspector"},
        "Animal Control Department":                {"officer_id": "OFF-2026-1038", "name": "Seema Awasthi",   "designation": "Animal Control Officer"},
        "Pollution Control Board":                  {"officer_id": "OFF-2026-1039", "name": "Ajay Shukla",     "designation": "Pollution Inspector"},
        "General Grievance Cell":                   {"officer_id": "OFF-2026-1030", "name": "Manju Saxena",    "designation": "Grievance Officer"},
    },
    "Zone-4 (North)": {
        # Zone-4 uses the seeded demo officer for Roads (matches DB seed OFF-2026-001)
        "Public Works Department (Roads)":          {"officer_id": "OFF-2026-001",  "name": "Rajesh Kumar",    "designation": "Senior Ward Officer"},
        "Water and Sewage Board":                   {"officer_id": "OFF-2026-1042", "name": "Preethi Nair",    "designation": "Sewage Engineer"},
        "Waste Management & Sanitation Department": {"officer_id": "OFF-2026-1043", "name": "Bharat Lal",      "designation": "Sanitation Supervisor"},
        "Electricity Board":                        {"officer_id": "OFF-2026-1044", "name": "Santosh Dubey",   "designation": "Electrical Inspector"},
        "Horticulture / Forestry Department":       {"officer_id": "OFF-2026-1045", "name": "Madhuri Tiwari",  "designation": "Horticulture Officer"},
        "Municipal Corporation (Encroachment Cell)":{"officer_id": "OFF-2026-1046", "name": "Yogesh Aggarwal", "designation": "Encroachment Officer"},
        "Traffic Police Department":                {"officer_id": "OFF-2026-1047", "name": "Devendra Singh",  "designation": "Traffic Sub-Inspector"},
        "Animal Control Department":                {"officer_id": "OFF-2026-1048", "name": "Kamla Devi",      "designation": "Animal Control Officer"},
        "Pollution Control Board":                  {"officer_id": "OFF-2026-1049", "name": "Ashwani Garg",    "designation": "Pollution Inspector"},
        "General Grievance Cell":                   {"officer_id": "OFF-2026-001",  "name": "Rajesh Kumar",    "designation": "Senior Ward Officer"},
    },
}

# =====================================================
# SUPPORTED ZONES (for validation)
# =====================================================

SUPPORTED_ZONES = list(ZONE_OFFICERS.keys())

# =====================================================
# CORE ROUTING FUNCTIONS
# =====================================================

def get_assigned_department(issue_type: str) -> str:
    """
    Map a classified issue type tag to its responsible municipal department.

    Uses a hash-map (dict) for O(1) average-case lookup — far more
    efficient and maintainable than a long if/elif ladder.

    Args:
        issue_type: Classified issue string, e.g. "Pothole", "Garbage".
                    Case-sensitive; must match keys in ISSUE_ROUTING exactly.

    Returns:
        Department name string. Falls back to FALLBACK_DEPARTMENT if
        issue_type is unrecognised.

    Examples:
        >>> get_assigned_department("Pothole")
        'Public Works Department (Roads)'
        >>> get_assigned_department("Unknown Issue")
        'General Grievance Cell'
    """
    return ISSUE_ROUTING.get(issue_type, FALLBACK_DEPARTMENT)


def get_assigned_officer(department: str, zone_id: Optional[str] = None) -> dict:
    """
    Return the officer assigned to a given department in a specific zone.

    Falls back to Zone-4 (North) if the zone_id is absent or unrecognised,
    since that is the default zone in the existing DB seed.

    Args:
        department: Department string returned by get_assigned_department().
        zone_id:    Zone identifier, e.g. "Zone-4 (North)". Optional.

    Returns:
        dict with keys: officer_id, name, designation.
    """
    # Normalise zone — default to Zone-4 (North) which has the seeded officer
    resolved_zone = zone_id if zone_id in ZONE_OFFICERS else "Zone-4 (North)"
    zone_map = ZONE_OFFICERS[resolved_zone]

    # Look up department; fall back to General Grievance officer for the zone
    officer = zone_map.get(department, zone_map.get("General Grievance Cell", {
        "officer_id": "OFF-2026-001",
        "name": "Rajesh Kumar",
        "designation": "Senior Ward Officer"
    }))
    return officer


def route_issue(issue_type: str, zone_id: Optional[str] = None) -> dict:
    """
    Full routing pipeline: takes a classified issue tag and zone,
    returns a complete routing result ready to be stored in the reports DB.

    This is the primary entry point called by Flask endpoints.

    Args:
        issue_type: Classified civic issue string, e.g. "Pothole".
        zone_id:    Zone identifier, e.g. "Zone-4 (North)". Optional.

    Returns:
        dict with keys:
            issue_type          - echoed back for confirmation
            department          - assigned municipal department
            officer_id          - unique officer identifier string
            officer_name        - display name of assigned officer
            officer_designation - role title of assigned officer
            zone_id             - resolved zone used for assignment
            is_fallback         - True if issue_type was unrecognised

    Example return value:
        {
            "issue_type":           "Pothole",
            "department":           "Public Works Department (Roads)",
            "officer_id":           "OFF-2026-001",
            "officer_name":         "Rajesh Kumar",
            "officer_designation":  "Senior Ward Officer",
            "zone_id":              "Zone-4 (North)",
            "is_fallback":          False
        }
    """
    department = get_assigned_department(issue_type)
    is_fallback = department == FALLBACK_DEPARTMENT
    resolved_zone = zone_id if zone_id in ZONE_OFFICERS else "Zone-4 (North)"
    officer = get_assigned_officer(department, resolved_zone)

    return {
        "issue_type":           issue_type,
        "department":           department,
        "officer_id":           officer["officer_id"],
        "officer_name":         officer["name"],
        "officer_designation":  officer["designation"],
        "zone_id":              resolved_zone,
        "is_fallback":          is_fallback,
    }


def get_all_issue_types() -> list[str]:
    """Return a sorted list of all recognised civic issue type tags."""
    return sorted(ISSUE_ROUTING.keys())


def get_all_departments() -> list[str]:
    """Return a deduplicated, sorted list of all department names."""
    return sorted(set(ISSUE_ROUTING.values()))
