"""
lucknow_wards.py — Official Lucknow Municipal Corporation (नगर निगम लखनऊ) Ward & Zone Directory
------------------------------------------------------------------------------------------------
Contains the complete 110 Wards distributed across 8 Administrative Zones, along with
key localities, landmarks, Vidhan Sabha areas, and geographic centroids for geolocation matching.
"""

import math
from typing import Dict, List, Optional, Tuple, Any

# Complete 110 Ward Directory from Lucknow Municipal Corporation
LUCKNOW_WARDS: List[Dict[str, Any]] = [
    # ── Page 1: Wards 1 to 28 ───────────────────────────────────────
    {
        "ward_no": 1,
        "ward_name": "Shraddheya Atal Bihari Vajpayee",
        "zone_no": 8,
        "zone_id": "Zone-8",
        "key_localities": ["Bangla Bazar", "Ashiyana", "Bangla Bazar Road", "Smriti Upvan"],
        "vidhan_sabha": "Sarojini Nagar",
        "lat": 26.7885, "lng": 80.9150
    },
    {
        "ward_no": 2,
        "ward_name": "Sharda Nagar - II",
        "zone_no": 8,
        "zone_id": "Zone-8",
        "key_localities": ["Ratan Khand", "Sharda Nagar", "Ratan Khand Ashiyana"],
        "vidhan_sabha": "Sarojini Nagar",
        "lat": 26.7760, "lng": 80.9230
    },
    {
        "ward_no": 3,
        "ward_name": "Ibrahimpur - II",
        "zone_no": 8,
        "zone_id": "Zone-8",
        "key_localities": ["Ibrahimpur", "Sector K", "Sector K Ashiyana"],
        "vidhan_sabha": "Sarojini Nagar",
        "lat": 26.7820, "lng": 80.9080
    },
    {
        "ward_no": 4,
        "ward_name": "Ibrahimpur - I",
        "zone_no": 8,
        "zone_id": "Zone-8",
        "key_localities": ["Ibrahimpur", "Sector L", "Sector L Ashiyana", "Ibrahimpur Gaon"],
        "vidhan_sabha": "Sarojini Nagar",
        "lat": 26.7790, "lng": 80.9030
    },
    {
        "ward_no": 5,
        "ward_name": "Raja Bijli Pasi - II",
        "zone_no": 8,
        "zone_id": "Zone-8",
        "key_localities": ["Sector H", "Ashiyana", "Sector H Ashiyana", "Bijli Pasi Qila"],
        "vidhan_sabha": "Sarojini Nagar",
        "lat": 26.7920, "lng": 80.9120
    },
    {
        "ward_no": 6,
        "ward_name": "Raja Bijli Pasi - I",
        "zone_no": 8,
        "zone_id": "Zone-8",
        "key_localities": ["Sector G", "Ashiyana", "Sector G Ashiyana"],
        "vidhan_sabha": "Sarojini Nagar",
        "lat": 26.7960, "lng": 80.9160
    },
    {
        "ward_no": 7,
        "ward_name": "Late Lalji Tandon Ward",
        "zone_no": 6,
        "zone_id": "Zone-6",
        "key_localities": ["Chowk", "Victoria Street", "Chowk Crossing", "Medical College Marg"],
        "vidhan_sabha": "Paschim",
        "lat": 26.8680, "lng": 80.9040
    },
    {
        "ward_no": 8,
        "ward_name": "Ambedkar Nagar",
        "zone_no": 2,
        "zone_id": "Zone-2",
        "key_localities": ["Model House", "Bansmandi", "Ambedkar Nagar", "Lalbagh West"],
        "vidhan_sabha": "Cantt / Madhya",
        "lat": 26.8410, "lng": 80.9320
    },
    {
        "ward_no": 9,
        "ward_name": "Late Kalyan Singh Ward",
        "zone_no": 6,
        "zone_id": "Zone-6",
        "key_localities": ["Campbell Road", "Rajajipuram", "Campbell Road Chauraha"],
        "vidhan_sabha": "Paschim",
        "lat": 26.8620, "lng": 80.8920
    },
    {
        "ward_no": 10,
        "ward_name": "Sarojini Nagar - I",
        "zone_no": 5,
        "zone_id": "Zone-5",
        "key_localities": ["Transport Nagar", "Kanpur Road", "Sarojini Nagar Industrial", "Amausi"],
        "vidhan_sabha": "Sarojini Nagar",
        "lat": 26.7630, "lng": 80.8850
    },
    {
        "ward_no": 11,
        "ward_name": "Shaheed Bhagat Singh - II",
        "zone_no": 7,
        "zone_id": "Zone-7",
        "key_localities": ["Sector 11", "Sector 12", "Sector 13", "Sector 14", "Indira Nagar", "Indira Nagar Sector 11-14"],
        "vidhan_sabha": "Bakshi Ka Talab / Poorab",
        "lat": 26.8850, "lng": 80.9950
    },
    {
        "ward_no": 12,
        "ward_name": "Khargapur - Sarsawan",
        "zone_no": 4,
        "zone_id": "Zone-4",
        "key_localities": ["Khargapur", "Sarsawan", "Gomti Nagar Extension", "Gomti Nagar Ext", "Shaheed Path Khargapur"],
        "vidhan_sabha": "Bakshi Ka Talab / Poorab",
        "lat": 26.8350, "lng": 81.0150
    },
    {
        "ward_no": 13,
        "ward_name": "Shaheed Bhagat Singh - I",
        "zone_no": 7,
        "zone_id": "Zone-7",
        "key_localities": ["Sector 8", "Sector 9", "Sector 10", "Indira Nagar", "Indira Nagar Sector 8-10"],
        "vidhan_sabha": "Bakshi Ka Talab / Poorab",
        "lat": 26.8820, "lng": 80.9880
    },
    {
        "ward_no": 14,
        "ward_name": "Bharwara - Malhaur",
        "zone_no": 4,
        "zone_id": "Zone-4",
        "key_localities": ["Malhaur", "Bharwara", "Gomti Nagar Vistar", "Malhaur Railway Station"],
        "vidhan_sabha": "Bakshi Ka Talab / Poorab",
        "lat": 26.8650, "lng": 81.0350
    },
    {
        "ward_no": 15,
        "ward_name": "Lal Bahadur Shastri - I",
        "zone_no": 7,
        "zone_id": "Zone-7",
        "key_localities": ["Sector 15", "Sector 16", "Sector 17", "Sector 18", "Indira Nagar", "Indira Nagar Sector 15-18", "Munshipulia"],
        "vidhan_sabha": "Poorab",
        "lat": 26.8920, "lng": 80.9920
    },
    {
        "ward_no": 16,
        "ward_name": "Faizullaganj - IV",
        "zone_no": 3,
        "zone_id": "Zone-3",
        "key_localities": ["Mohibullapur", "Faizullaganj", "Mohibullapur Station", "Sitapur Road Mohibullapur"],
        "vidhan_sabha": "Uttar",
        "lat": 26.9080, "lng": 80.9280
    },
    {
        "ward_no": 17,
        "ward_name": "Vikramaditya - Mahatma Gandhi",
        "zone_no": 1,
        "zone_id": "Zone-1",
        "key_localities": ["Mall Avenue", "Vikramaditya Marg", "Raj Bhavan Area", "Gautam Palli"],
        "vidhan_sabha": "Madhya",
        "lat": 26.8370, "lng": 80.9480
    },
    {
        "ward_no": 18,
        "ward_name": "Sarojini Nagar - II",
        "zone_no": 5,
        "zone_id": "Zone-5",
        "key_localities": ["Chander Nagar", "Alambagh", "Chander Nagar Market", "Alambagh Chauraha"],
        "vidhan_sabha": "Sarojini Nagar",
        "lat": 26.8080, "lng": 80.9020
    },
    {
        "ward_no": 19,
        "ward_name": "Sharda Nagar - I",
        "zone_no": 8,
        "zone_id": "Zone-8",
        "key_localities": ["Ruchi Khand", "Sharda Nagar", "Ruchi Khand Sharda Nagar"],
        "vidhan_sabha": "Sarojini Nagar",
        "lat": 26.7720, "lng": 80.9280
    },
    {
        "ward_no": 20,
        "ward_name": "New Haiderganj - III",
        "zone_no": 6,
        "zone_id": "Zone-6",
        "key_localities": ["Haiderganj", "Campbell Road", "Haiderganj Camp Road"],
        "vidhan_sabha": "Paschim",
        "lat": 26.8580, "lng": 80.8980
    },
    {
        "ward_no": 21,
        "ward_name": "Malviya Nagar",
        "zone_no": 2,
        "zone_id": "Zone-2",
        "key_localities": ["Aishbagh", "Malviya Nagar", "Aishbagh Road"],
        "vidhan_sabha": "Madhya",
        "lat": 26.8350, "lng": 80.9150
    },
    {
        "ward_no": 22,
        "ward_name": "Jankipuram - III",
        "zone_no": 3,
        "zone_id": "Zone-3",
        "key_localities": ["Sector 5", "Sector 6", "Jankipuram Vistar", "Jankipuram Extension", "Engineering College Extension"],
        "vidhan_sabha": "Uttar",
        "lat": 26.9350, "lng": 80.9520
    },
    {
        "ward_no": 23,
        "ward_name": "Guru Nanak Nagar",
        "zone_no": 5,
        "zone_id": "Zone-5",
        "key_localities": ["Guru Nanak Nagar", "Alambagh", "Guru Nanak Nagar Alambagh"],
        "vidhan_sabha": "Cantt",
        "lat": 26.8150, "lng": 80.9080
    },
    {
        "ward_no": 24,
        "ward_name": "Saadatganj",
        "zone_no": 6,
        "zone_id": "Zone-6",
        "key_localities": ["Saadatganj", "Kashmiri Mohalla", "Saadatganj Bazar"],
        "vidhan_sabha": "Paschim",
        "lat": 26.8550, "lng": 80.8920
    },
    {
        "ward_no": 25,
        "ward_name": "Babu Kunj Bihari - Om Nagar",
        "zone_no": 5,
        "zone_id": "Zone-5",
        "key_localities": ["Om Nagar", "Shanti Nagar", "Sujanpura", "Alambagh Om Nagar"],
        "vidhan_sabha": "Cantt",
        "lat": 26.8190, "lng": 80.9140
    },
    {
        "ward_no": 26,
        "ward_name": "Aishbagh",
        "zone_no": 2,
        "zone_id": "Zone-2",
        "key_localities": ["Mill Road", "Motinagar", "Aishbagh Stadium", "Aishbagh Railway Colony"],
        "vidhan_sabha": "Madhya",
        "lat": 26.8380, "lng": 80.9180
    },
    {
        "ward_no": 27,
        "ward_name": "Balaganj",
        "zone_no": 6,
        "zone_id": "Zone-6",
        "key_localities": ["Balaganj", "Hardoi Road", "Balaganj Chauraha", "Thakurganj Balaganj"],
        "vidhan_sabha": "Paschim",
        "lat": 26.8780, "lng": 80.8850
    },
    {
        "ward_no": 28,
        "ward_name": "Raja Rammohan Roy",
        "zone_no": 1,
        "zone_id": "Zone-1",
        "key_localities": ["Lalbagh", "Park Road", "Hazratganj South", "Naval Kishore Road"],
        "vidhan_sabha": "Madhya",
        "lat": 26.8440, "lng": 80.9420
    },

    # ── Page 2: Wards 29 to 62 ──────────────────────────────────────
    {
        "ward_no": 29,
        "ward_name": "Kharika - II",
        "zone_no": 8,
        "zone_id": "Zone-8",
        "key_localities": ["Telibagh", "Kharika", "Telibagh Bazar", "Kharika Road"],
        "vidhan_sabha": "Sarojini Nagar",
        "lat": 26.7920, "lng": 80.9380
    },
    {
        "ward_no": 30,
        "ward_name": "Kharika - I",
        "zone_no": 8,
        "zone_id": "Zone-8",
        "key_localities": ["Telibagh", "Gandhi Nagar", "Gandhi Nagar Telibagh", "Defence Colony Telibagh"],
        "vidhan_sabha": "Sarojini Nagar",
        "lat": 26.7970, "lng": 80.9350
    },
    {
        "ward_no": 31,
        "ward_name": "Jankipuram - I",
        "zone_no": 3,
        "zone_id": "Zone-3",
        "key_localities": ["Sector 1", "Sector 2", "Sector 3", "Sector 4", "Jankipuram", "Engineering College Chauraha", "Jankipuram Main"],
        "vidhan_sabha": "Uttar",
        "lat": 26.9200, "lng": 80.9450
    },
    {
        "ward_no": 32,
        "ward_name": "Alamnagar",
        "zone_no": 6,
        "zone_id": "Zone-6",
        "key_localities": ["Alamnagar", "Rajajipuram Sec E", "Alamnagar Station", "Rajajipuram Sector E"],
        "vidhan_sabha": "Paschim",
        "lat": 26.8480, "lng": 80.8780
    },
    {
        "ward_no": 33,
        "ward_name": "Lalkuan",
        "zone_no": 1,
        "zone_id": "Zone-1",
        "key_localities": ["Lalkuan", "Hussainganj", "Lalkuan Chauraha", "Chittwapur"],
        "vidhan_sabha": "Cantt / Madhya",
        "lat": 26.8380, "lng": 80.9360
    },
    {
        "ward_no": 34,
        "ward_name": "Hazratganj - Ramteerth",
        "zone_no": 1,
        "zone_id": "Zone-1",
        "key_localities": ["Hazratganj", "Narhi", "Butler Palace", "MG Marg", "Mayfair", "Janpath Market", "GPO"],
        "vidhan_sabha": "Madhya",
        "lat": 26.8510, "lng": 80.9460
    },
    {
        "ward_no": 35,
        "ward_name": "Hind Nagar",
        "zone_no": 5,
        "zone_id": "Zone-5",
        "key_localities": ["Hind Nagar", "VIP Road", "Kanpur Road Hind Nagar", "Old Airport Area"],
        "vidhan_sabha": "Sarojini Nagar",
        "lat": 26.7900, "lng": 80.8950
    },
    {
        "ward_no": 36,
        "ward_name": "Keshari Kheda",
        "zone_no": 5,
        "zone_id": "Zone-5",
        "key_localities": ["Keshari Kheda", "Krishna Nagar", "Krishna Nagar Metro", "Keshari Kheda Colony"],
        "vidhan_sabha": "Cantt",
        "lat": 26.8020, "lng": 80.8920
    },
    {
        "ward_no": 37,
        "ward_name": "Gomti Nagar",
        "zone_no": 4,
        "zone_id": "Zone-4",
        "key_localities": ["Vipul Khand", "Vishal Khand", "Gomti Nagar", "Patrakarpuram", "Gomti Nagar Main"],
        "vidhan_sabha": "Poorab",
        "lat": 26.8550, "lng": 80.9980
    },
    {
        "ward_no": 38,
        "ward_name": "Kanhaiya Madhavpur - II",
        "zone_no": 6,
        "zone_id": "Zone-6",
        "key_localities": ["Madhavpur", "Hardoi Road", "Dubagga Road", "Kanhaiya Madhavpur 2"],
        "vidhan_sabha": "Paschim",
        "lat": 26.8720, "lng": 80.8720
    },
    {
        "ward_no": 39,
        "ward_name": "New Haiderganj - II",
        "zone_no": 6,
        "zone_id": "Zone-6",
        "key_localities": ["Haiderganj", "Tikait Rai Talab", "Millat Nagar", "Haiderganj 2"],
        "vidhan_sabha": "Paschim",
        "lat": 26.8480, "lng": 80.8950
    },
    {
        "ward_no": 40,
        "ward_name": "Indira Priyadarshini",
        "zone_no": 7,
        "zone_id": "Zone-7",
        "key_localities": ["Sector 19", "Sector 20", "Sector 21", "Indira Nagar", "Indira Nagar Sector 19-21", "Picnic Spot Road"],
        "vidhan_sabha": "Poorab",
        "lat": 26.8980, "lng": 80.9960
    },
    {
        "ward_no": 41,
        "ward_name": "Ramji Lal - Sardar Patel Nagar",
        "zone_no": 5,
        "zone_id": "Zone-5",
        "key_localities": ["Sardar Patel Nagar", "Alambagh", "Sardar Patel Marg", "Mawaiya West"],
        "vidhan_sabha": "Cantt",
        "lat": 26.8220, "lng": 80.9020
    },
    {
        "ward_no": 42,
        "ward_name": "Shankar Purwa - II",
        "zone_no": 4,
        "zone_id": "Zone-4",
        "key_localities": ["Takrohi", "Shankar Purwa", "Takrohi Market", "Shankar Purwa 2"],
        "vidhan_sabha": "Poorab",
        "lat": 26.8850, "lng": 81.0150
    },
    {
        "ward_no": 43,
        "ward_name": "Ismailganj - II",
        "zone_no": 4,
        "zone_id": "Zone-4",
        "key_localities": ["Ismailganj", "Faizabad Road", "Ismailganj 2", "Faizabad Road Ismailganj"],
        "vidhan_sabha": "Poorab",
        "lat": 26.8820, "lng": 81.0220
    },
    {
        "ward_no": 44,
        "ward_name": "Faizullaganj - II",
        "zone_no": 3,
        "zone_id": "Zone-3",
        "key_localities": ["Gau Ghat", "Faizullaganj", "Gau Ghat Faizullaganj", "Bandha Road Faizullaganj"],
        "vidhan_sabha": "Uttar",
        "lat": 26.9020, "lng": 80.9220
    },
    {
        "ward_no": 45,
        "ward_name": "Guru Govind Singh",
        "zone_no": 5,
        "zone_id": "Zone-5",
        "key_localities": ["Alambagh", "Singar Nagar", "Singar Nagar Metro", "Alambagh Bus Stand"],
        "vidhan_sabha": "Cantt",
        "lat": 26.8120, "lng": 80.8980
    },
    {
        "ward_no": 46,
        "ward_name": "Kunwar Jyoti Prasad",
        "zone_no": 6,
        "zone_id": "Zone-6",
        "key_localities": ["Bhadewan", "Talkatora", "Talkatora Industrial", "Talkatora Road"],
        "vidhan_sabha": "Paschim",
        "lat": 26.8420, "lng": 80.8920
    },
    {
        "ward_no": 47,
        "ward_name": "Daliganj - Nirala Nagar",
        "zone_no": 3,
        "zone_id": "Zone-3",
        "key_localities": ["Nirala Nagar", "Daliganj Railway Stn", "Daliganj", "Nirala Nagar Park", "IT College North"],
        "vidhan_sabha": "Uttar",
        "lat": 26.8780, "lng": 80.9420
    },
    {
        "ward_no": 48,
        "ward_name": "Faizullaganj - I",
        "zone_no": 3,
        "zone_id": "Zone-3",
        "key_localities": ["Shyam Nagar", "Faizullaganj", "Shyam Nagar Faizullaganj", "Sitapur Road Shyam Nagar"],
        "vidhan_sabha": "Uttar",
        "lat": 26.9120, "lng": 80.9180
    },
    {
        "ward_no": 49,
        "ward_name": "Mahakavi Jai Shankar Prasad",
        "zone_no": 3,
        "zone_id": "Zone-3",
        "key_localities": ["Triveni Nagar", "Sitapur Road", "Triveni Nagar 2", "Khadra North"],
        "vidhan_sabha": "Uttar",
        "lat": 26.8950, "lng": 80.9320
    },
    {
        "ward_no": 50,
        "ward_name": "Chinhat - I",
        "zone_no": 4,
        "zone_id": "Zone-4",
        "key_localities": ["Chinhat Bazaar", "Deva Road", "Chinhat Tiraha", "Chinhat Industrial Area"],
        "vidhan_sabha": "Bakshi Ka Talab / Poorab",
        "lat": 26.8850, "lng": 81.0450
    },
    {
        "ward_no": 51,
        "ward_name": "Ismailganj - I",
        "zone_no": 4,
        "zone_id": "Zone-4",
        "key_localities": ["Kamta", "Ismailganj", "Kamta Chauraha", "Polytechnic Chauraha East"],
        "vidhan_sabha": "Poorab",
        "lat": 26.8780, "lng": 81.0150
    },
    {
        "ward_no": 52,
        "ward_name": "Kanhaiya Madhavpur - I",
        "zone_no": 6,
        "zone_id": "Zone-6",
        "key_localities": ["Kanhaiya Nagar", "Madhavpur", "Hardoi Road Kanhaiya Nagar"],
        "vidhan_sabha": "Paschim",
        "lat": 26.8650, "lng": 80.8780
    },
    {
        "ward_no": 53,
        "ward_name": "Mahanagar",
        "zone_no": 3,
        "zone_id": "Zone-3",
        "key_localities": ["Mahanagar", "Badshahnagar", "Mahanagar Extension", "Gole Market Mahanagar", "Badshahnagar Railway Station"],
        "vidhan_sabha": "Poorab / Uttar",
        "lat": 26.8720, "lng": 80.9580
    },
    {
        "ward_no": 54,
        "ward_name": "Geeta Palli",
        "zone_no": 5,
        "zone_id": "Zone-5",
        "key_localities": ["Geeta Palli", "Alambagh", "VIP Road Alambagh", "Geeta Palli Chauraha"],
        "vidhan_sabha": "Cantt",
        "lat": 26.8050, "lng": 80.9080
    },
    {
        "ward_no": 55,
        "ward_name": "Rani Laxmi Bai",
        "zone_no": 1,
        "zone_id": "Zone-1",
        "key_localities": ["Aminabad", "Kaiserbagh", "Aminabad Park", "Kaiserbagh Bus Stand West", "Nazirabad"],
        "vidhan_sabha": "Madhya",
        "lat": 26.8480, "lng": 80.9320
    },
    {
        "ward_no": 56,
        "ward_name": "Vidyawati Devi - II",
        "zone_no": 8,
        "zone_id": "Zone-8",
        "key_localities": ["Sector D", "LDA Colony", "Kanpur Rd", "LDA Colony Sector D", "Kanpur Road LDA"],
        "vidhan_sabha": "Sarojini Nagar",
        "lat": 26.7850, "lng": 80.8980
    },
    {
        "ward_no": 57,
        "ward_name": "Babu Banarasi Das",
        "zone_no": 1,
        "zone_id": "Zone-1",
        "key_localities": ["Cantonment", "KKC", "Charbagh", "Shri Jai Narain PG College", "Station Road"],
        "vidhan_sabha": "Cantt / Madhya",
        "lat": 26.8320, "lng": 80.9380
    },
    {
        "ward_no": 58,
        "ward_name": "Motilal Nehru - CB Gupta Nagar",
        "zone_no": 2,
        "zone_id": "Zone-2",
        "key_localities": ["Charbagh", "Bansmandi", "Arya Nagar", "Charbagh Railway Station", "CB Gupta Nagar"],
        "vidhan_sabha": "Cantt / Madhya",
        "lat": 26.8280, "lng": 80.9250
    },
    {
        "ward_no": 59,
        "ward_name": "Colvin College - Nishatganj",
        "zone_no": 3,
        "zone_id": "Zone-3",
        "key_localities": ["Nishatganj", "University Road", "Colvin Taluqdars College", "Lucknow University", "Nishatganj Bridge"],
        "vidhan_sabha": "Poorab",
        "lat": 26.8620, "lng": 80.9520
    },
    {
        "ward_no": 60,
        "ward_name": "Vidyawati Devi - III",
        "zone_no": 8,
        "zone_id": "Zone-8",
        "key_localities": ["Transport Nagar", "Sector B", "LDA Colony Sector B", "Transport Nagar Ashiyana"],
        "vidhan_sabha": "Sarojini Nagar",
        "lat": 26.7780, "lng": 80.8890
    },
    {
        "ward_no": 61,
        "ward_name": "Tilak Nagar - Kundari Rakabganj",
        "zone_no": 2,
        "zone_id": "Zone-2",
        "key_localities": ["Kundari Rakabganj", "Naka", "Naka Hindola", "Tilak Nagar", "Rakabganj"],
        "vidhan_sabha": "Madhya",
        "lat": 26.8390, "lng": 80.9240
    },
    {
        "ward_no": 62,
        "ward_name": "Rafi Ahmed Kidwai",
        "zone_no": 1,
        "zone_id": "Zone-1",
        "key_localities": ["Cantonment Marg", "Qaiserbagh", "Kaiserbagh Chauraha", "Collectorate"],
        "vidhan_sabha": "Madhya",
        "lat": 26.8490, "lng": 80.9380
    },

    # ── Page 3: Wards 63 to 95 ──────────────────────────────────────
    {
        "ward_no": 63,
        "ward_name": "Ayodhya Das - II",
        "zone_no": 3,
        "zone_id": "Zone-3",
        "key_localities": ["Mahanagar Extension", "Rahim Nagar", "Khurram Nagar Border", "Rahim Nagar Duda"],
        "vidhan_sabha": "Uttar",
        "lat": 26.8850, "lng": 80.9650
    },
    {
        "ward_no": 64,
        "ward_name": "Vidyawati Devi - I",
        "zone_no": 8,
        "zone_id": "Zone-8",
        "key_localities": ["Sector C", "Mansarovar", "Mansarovar Sector C", "Mansarovar Colony", "Kanpur Road Mansarovar"],
        "vidhan_sabha": "Sarojini Nagar",
        "lat": 26.7820, "lng": 80.8920
    },
    {
        "ward_no": 65,
        "ward_name": "Chitragupta Nagar",
        "zone_no": 5,
        "zone_id": "Zone-5",
        "key_localities": ["Chitragupta Nagar", "Alambagh", "Chitragupta Nagar Alambagh", "Pakri Ka Pul"],
        "vidhan_sabha": "Cantt",
        "lat": 26.8180, "lng": 80.8950
    },
    {
        "ward_no": 66,
        "ward_name": "Chinhat - II",
        "zone_no": 4,
        "zone_id": "Zone-4",
        "key_localities": ["Matiyari", "Uttardhona", "Chinhat", "Matiyari Chauraha", "Faizabad Road Matiyari"],
        "vidhan_sabha": "Bakshi Ka Talab / Poorab",
        "lat": 26.8920, "lng": 81.0550
    },
    {
        "ward_no": 67,
        "ward_name": "Lala Lajpat Rai",
        "zone_no": 3,
        "zone_id": "Zone-3",
        "key_localities": ["Aliganj Sector A", "Aliganj Sector B", "Aliganj Sector C", "Kapurthala", "Kapurthala Chauraha", "Aliganj Kapurthala"],
        "vidhan_sabha": "Uttar",
        "lat": 26.8820, "lng": 80.9420
    },
    {
        "ward_no": 68,
        "ward_name": "Babu Jagjivan Ram",
        "zone_no": 7,
        "zone_id": "Zone-7",
        "key_localities": ["Indira Nagar Sector 22", "Sector 23", "Sector 24", "Sector 25", "Indira Nagar Sector 22-25", "Manas Enclave"],
        "vidhan_sabha": "Poorab",
        "lat": 26.9050, "lng": 80.9980
    },
    {
        "ward_no": 69,
        "ward_name": "Jagdish Chandra Bose",
        "zone_no": 1,
        "zone_id": "Zone-1",
        "key_localities": ["Jadunath Sanyal Marg", "Hussainganj", "Hussainganj Crossing", "Station Road North"],
        "vidhan_sabha": "Madhya",
        "lat": 26.8420, "lng": 80.9350
    },
    {
        "ward_no": 70,
        "ward_name": "Paper Mill Colony",
        "zone_no": 3,
        "zone_id": "Zone-3",
        "key_localities": ["Paper Mill Colony", "Badshahnagar", "Nishatganj Paper Mill", "Kapoorthala Road South"],
        "vidhan_sabha": "Poorab",
        "lat": 26.8680, "lng": 80.9520
    },
    {
        "ward_no": 71,
        "ward_name": "Mankameshwar Mandir",
        "zone_no": 3,
        "zone_id": "Zone-3",
        "key_localities": ["Daliganj", "Mankameshwar", "Mankameshwar Mandir", "Mukarimnagar", "Gomti Ghat Daliganj"],
        "vidhan_sabha": "Uttar",
        "lat": 26.8680, "lng": 80.9320
    },
    {
        "ward_no": 72,
        "ward_name": "Shankar Purwa - III",
        "zone_no": 4,
        "zone_id": "Zone-4",
        "key_localities": ["Kalyanpur", "Ring Road", "Kalyanpur Ring Road", "Kalyanpur West"],
        "vidhan_sabha": "Poorab",
        "lat": 26.9020, "lng": 80.9680
    },
    {
        "ward_no": 73,
        "ward_name": "Faizullaganj - III",
        "zone_no": 3,
        "zone_id": "Zone-3",
        "key_localities": ["Krishna Lok", "Faizullaganj", "Krishna Lok Colony", "Faizullaganj 3"],
        "vidhan_sabha": "Uttar",
        "lat": 26.9180, "lng": 80.9250
    },
    {
        "ward_no": 74,
        "ward_name": "Jankipuram - II",
        "zone_no": 3,
        "zone_id": "Zone-3",
        "key_localities": ["Sector F", "Sector G", "Sector H", "Sector J", "Sahara State", "Jankipuram Sahara State", "Atal Chauraha Jankipuram"],
        "vidhan_sabha": "Uttar",
        "lat": 26.9280, "lng": 80.9480
    },
    {
        "ward_no": 75,
        "ward_name": "Bhartendu Harishchandra",
        "zone_no": 3,
        "zone_id": "Zone-3",
        "key_localities": ["Aliganj Sector D", "Aliganj Sector E", "Aliganj Sector F", "Aliganj Sector G", "Dandiya", "Dandiya Bazar Aliganj", "Aliganj Post Office"],
        "vidhan_sabha": "Uttar",
        "lat": 26.8880, "lng": 80.9460
    },
    {
        "ward_no": 76,
        "ward_name": "Rajiv Gandhi - I",
        "zone_no": 4,
        "zone_id": "Zone-4",
        "key_localities": ["Vikas Khand", "Vinay Khand", "Gomti Nagar Vikas Khand", "Gomti Nagar Vinay Khand", "Dayal Paradise Area"],
        "vidhan_sabha": "Poorab",
        "lat": 26.8520, "lng": 81.0080
    },
    {
        "ward_no": 77,
        "ward_name": "Maithili Sharan Gupt",
        "zone_no": 7,
        "zone_id": "Zone-7",
        "key_localities": ["Indira Nagar Sector 1", "Sector 2", "Sector 3", "Sector 4", "Indira Nagar Sector 1-4", "Bhootnath Market", "Bhootnath"],
        "vidhan_sabha": "Poorab",
        "lat": 26.8750, "lng": 80.9850
    },
    {
        "ward_no": 78,
        "ward_name": "Labor Colony",
        "zone_no": 2,
        "zone_id": "Zone-2",
        "key_localities": ["Mill Area", "Aishbagh Colony", "Labor Colony", "Aishbagh Industrial"],
        "vidhan_sabha": "Paschim",
        "lat": 26.8320, "lng": 80.9080
    },
    {
        "ward_no": 79,
        "ward_name": "Rajajipuram",
        "zone_no": 2,
        "zone_id": "Zone-2",
        "key_localities": ["Sector 11", "Sector 12", "Sector 13", "Rajajipuram", "Rajajipuram Sector 11-13", "Meena Bakery Chauraha"],
        "vidhan_sabha": "Paschim",
        "lat": 26.8520, "lng": 80.8850
    },
    {
        "ward_no": 80,
        "ward_name": "Indira Nagar",
        "zone_no": 7,
        "zone_id": "Zone-7",
        "key_localities": ["Sector B", "Sector C", "Sector D", "Indira Nagar", "Indira Nagar Sector B C D", "Kaleva Chauraha"],
        "vidhan_sabha": "Poorab",
        "lat": 26.8820, "lng": 80.9780
    },
    {
        "ward_no": 81,
        "ward_name": "Mallahi Tola - II",
        "zone_no": 6,
        "zone_id": "Zone-6",
        "key_localities": ["Mallahi Tola", "Thakurganj", "Mallahi Tola 2", "Gau Ghat South"],
        "vidhan_sabha": "Uttar / Paschim",
        "lat": 26.8720, "lng": 80.8980
    },
    {
        "ward_no": 82,
        "ward_name": "Triveni Nagar",
        "zone_no": 3,
        "zone_id": "Zone-3",
        "key_localities": ["Triveni Nagar", "Sitapur Road", "Triveni Nagar 3", "Preeti Nagar"],
        "vidhan_sabha": "Uttar",
        "lat": 26.8980, "lng": 80.9380
    },
    {
        "ward_no": 83,
        "ward_name": "New Haiderganj - I",
        "zone_no": 6,
        "zone_id": "Zone-6",
        "key_localities": ["Haiderganj", "Victoria Road", "Haiderganj Chauraha", "Victoria Marg West"],
        "vidhan_sabha": "Paschim",
        "lat": 26.8520, "lng": 80.9020
    },
    {
        "ward_no": 84,
        "ward_name": "Kadam Rasool",
        "zone_no": 3,
        "zone_id": "Zone-3",
        "key_localities": ["Daliganj", "Hasanganj", "Kadam Rasool", "Hasanganj Chauraha", "Babu Ganj"],
        "vidhan_sabha": "Uttar",
        "lat": 26.8620, "lng": 80.9380
    },
    {
        "ward_no": 85,
        "ward_name": "Mallahi Tola - I",
        "zone_no": 6,
        "zone_id": "Zone-6",
        "key_localities": ["Thakurganj", "Victoria Street", "Mallahi Tola 1", "Thakurganj Thana"],
        "vidhan_sabha": "Uttar / Paschim",
        "lat": 26.8680, "lng": 80.8950
    },
    {
        "ward_no": 86,
        "ward_name": "Lohia Nagar",
        "zone_no": 7,
        "zone_id": "Zone-7",
        "key_localities": ["Lohia Nagar", "Ring Road", "Lohia Nagar Indira Nagar", "Khurram Nagar East"],
        "vidhan_sabha": "Poorab",
        "lat": 26.8920, "lng": 80.9720
    },
    {
        "ward_no": 87,
        "ward_name": "Gola Ganj - Peer Jaleel",
        "zone_no": 1,
        "zone_id": "Zone-1",
        "key_localities": ["Golaganj", "Kaiserbagh Bus Stand", "Peer Jaleel", "Bhatkhande Music Institute"],
        "vidhan_sabha": "Madhya",
        "lat": 26.8540, "lng": 80.9280
    },
    {
        "ward_no": 88,
        "ward_name": "Bashiratganj - Ganeshganj",
        "zone_no": 1,
        "zone_id": "Zone-1",
        "key_localities": ["Ganeshganj", "Aminabad", "Bashiratganj", "Ganeshganj Market"],
        "vidhan_sabha": "Madhya",
        "lat": 26.8420, "lng": 80.9280
    },
    {
        "ward_no": 89,
        "ward_name": "Sheetla Devi",
        "zone_no": 6,
        "zone_id": "Zone-6",
        "key_localities": ["Mehandi Ganj", "Tikait Rai Talab", "Sheetla Devi Mandir", "Mehandiganj"],
        "vidhan_sabha": "Paschim",
        "lat": 26.8450, "lng": 80.8880
    },
    {
        "ward_no": 90,
        "ward_name": "Rajendra Nagar",
        "zone_no": 2,
        "zone_id": "Zone-2",
        "key_localities": ["Rajendra Nagar", "Water Works", "Rajendra Nagar 1-5", "Motinagar East"],
        "vidhan_sabha": "Madhya",
        "lat": 26.8390, "lng": 80.9120
    },
    {
        "ward_no": 91,
        "ward_name": "Vivekanand Puri",
        "zone_no": 3,
        "zone_id": "Zone-3",
        "key_localities": ["Vivekanandpuri", "IT Crossing", "Vivekanand Polyclinic", "IT Chauraha", "Nirala Nagar South"],
        "vidhan_sabha": "Uttar / Poorab",
        "lat": 26.8720, "lng": 80.9480
    },
    {
        "ward_no": 92,
        "ward_name": "Shankar Purwa - I",
        "zone_no": 4,
        "zone_id": "Zone-4",
        "key_localities": ["Takrohi Road", "Indira Nagar Ext", "Shankar Purwa 1", "Amity University Road"],
        "vidhan_sabha": "Poorab",
        "lat": 26.8780, "lng": 81.0250
    },
    {
        "ward_no": 93,
        "ward_name": "Husainabad",
        "zone_no": 6,
        "zone_id": "Zone-6",
        "key_localities": ["Husainabad", "Clock Tower", "Rumi Darwaza", "Bada Imambara", "Chhota Imambara"],
        "vidhan_sabha": "Uttar / Paschim",
        "lat": 26.8720, "lng": 80.9120
    },
    {
        "ward_no": 94,
        "ward_name": "Daulatganj",
        "zone_no": 6,
        "zone_id": "Zone-6",
        "key_localities": ["Daulatganj", "Campbell Road", "Daulatganj Bazar", "Hardoi Road South"],
        "vidhan_sabha": "Uttar / Paschim",
        "lat": 26.8650, "lng": 80.8850
    },
    {
        "ward_no": 95,
        "ward_name": "Maulvi Ganj",
        "zone_no": 1,
        "zone_id": "Zone-1",
        "key_localities": ["Maulviganj", "Aminabad", "Maulviganj Thana", "Gwyne Road"],
        "vidhan_sabha": "Madhya",
        "lat": 26.8480, "lng": 80.9250
    },

    # ── Page 4: Wards 96 to 110 ─────────────────────────────────────
    {
        "ward_no": 96,
        "ward_name": "Lal Bahadur Shastri - II",
        "zone_no": 7,
        "zone_id": "Zone-7",
        "key_localities": ["Indira Nagar Sector 5", "Sector 6", "Sector 7", "Indira Nagar Sector 5-7", "Maniyanwa"],
        "vidhan_sabha": "Poorab",
        "lat": 26.8880, "lng": 80.9820
    },
    {
        "ward_no": 97,
        "ward_name": "Garhi Peer Khan",
        "zone_no": 6,
        "zone_id": "Zone-6",
        "key_localities": ["Garhi Peer Khan", "Thakurganj", "Garhi Peer Khan Thakurganj", "Radha Gram"],
        "vidhan_sabha": "Paschim",
        "lat": 26.8750, "lng": 80.8920
    },
    {
        "ward_no": 98,
        "ward_name": "Yadunath Sanyal - Nazarbagh",
        "zone_no": 1,
        "zone_id": "Zone-1",
        "key_localities": ["Nazarbagh", "Lalbagh", "Nazarbagh Chauraha", "Odeon Cinema Area"],
        "vidhan_sabha": "Madhya",
        "lat": 26.8450, "lng": 80.9380
    },
    {
        "ward_no": 99,
        "ward_name": "Acharya Narendra Dev",
        "zone_no": 1,
        "zone_id": "Zone-1",
        "key_localities": ["Hazratganj", "Ashok Marg", "Shakti Bhawan", "Jawahar Bhawan", "Indira Bhawan"],
        "vidhan_sabha": "Madhya",
        "lat": 26.8480, "lng": 80.9450
    },
    {
        "ward_no": 100,
        "ward_name": "Rajiv Gandhi - II",
        "zone_no": 7,
        "zone_id": "Zone-7",
        "key_localities": ["Viram Khand", "Vivek Khand", "Gomti Nagar Viram Khand", "Gomti Nagar Vivek Khand", "Haniman Chauraha"],
        "vidhan_sabha": "Poorab",
        "lat": 26.8620, "lng": 81.0050
    },
    {
        "ward_no": 101,
        "ward_name": "Amberganj",
        "zone_no": 6,
        "zone_id": "Zone-6",
        "key_localities": ["Amberganj", "Musahibganj", "Amberganj Chauraha", "Thakurganj Amberganj"],
        "vidhan_sabha": "Paschim",
        "lat": 26.8620, "lng": 80.8880
    },
    {
        "ward_no": 102,
        "ward_name": "Maulana Kalbe Abid",
        "zone_no": 6,
        "zone_id": "Zone-6",
        "key_localities": ["Muftiganj", "Nakkhas", "Nakkhas Chauraha", "Muftiganj Bazar"],
        "vidhan_sabha": "Paschim",
        "lat": 26.8580, "lng": 80.9120
    },
    {
        "ward_no": 103,
        "ward_name": "Mashakganj - Wazirganj",
        "zone_no": 1,
        "zone_id": "Zone-1",
        "key_localities": ["Wazirganj", "Mashakganj", "Wazirganj Thana", "Kaiserbagh Court Area"],
        "vidhan_sabha": "Madhya",
        "lat": 26.8520, "lng": 80.9220
    },
    {
        "ward_no": 104,
        "ward_name": "Yahiaganj - Netaji Subhash Bose",
        "zone_no": 2,
        "zone_id": "Zone-2",
        "key_localities": ["Yahiaganj", "Nakhas Crossing", "Yahiaganj Gurudwara", "Yahiaganj Bazar"],
        "vidhan_sabha": "Madhya",
        "lat": 26.8520, "lng": 80.9180
    },
    {
        "ward_no": 105,
        "ward_name": "Kashmiri Mohalla",
        "zone_no": 6,
        "zone_id": "Zone-6",
        "key_localities": ["Kashmiri Mohalla", "Mansoor Nagar", "Mansoor Nagar Chauraha"],
        "vidhan_sabha": "Paschim",
        "lat": 26.8550, "lng": 80.9050
    },
    {
        "ward_no": 106,
        "ward_name": "Chowk - Bazar Kali Ji",
        "zone_no": 6,
        "zone_id": "Zone-6",
        "key_localities": ["Chowk Bazaar", "Akbari Gate", "Chowk Mandi", "Kali Ji Mandir Chowk"],
        "vidhan_sabha": "Uttar / Paschim",
        "lat": 26.8650, "lng": 80.9080
    },
    {
        "ward_no": 107,
        "ward_name": "Raja Bazar",
        "zone_no": 2,
        "zone_id": "Zone-2",
        "key_localities": ["Raja Bazar", "Medical College Area", "KGMU", "King George Medical University", "Chowk South"],
        "vidhan_sabha": "Madhya",
        "lat": 26.8620, "lng": 80.9150
    },
    {
        "ward_no": 108,
        "ward_name": "Bhawaniganj",
        "zone_no": 6,
        "zone_id": "Zone-6",
        "key_localities": ["Bhawaniganj", "Campbell Road", "Bhawaniganj Chauraha", "Victoria Marg Campbell Rd"],
        "vidhan_sabha": "Paschim",
        "lat": 26.8590, "lng": 80.8950
    },
    {
        "ward_no": 109,
        "ward_name": "Aliganj",
        "zone_no": 3,
        "zone_id": "Zone-3",
        "key_localities": ["Sector H", "Sector J", "Sector H-J Aliganj", "Hanuman Temple", "Purana Aliganj Mandir", "Aliganj Sector H-J"],
        "vidhan_sabha": "Uttar",
        "lat": 26.8890, "lng": 80.9380
    },
    {
        "ward_no": 110,
        "ward_name": "Ayodhya Das - I",
        "zone_no": 3,
        "zone_id": "Zone-3",
        "key_localities": ["Mahanagar 3rd", "Faizabad Road", "Mahanagar Sector C", "Badshahnagar North"],
        "vidhan_sabha": "Uttar",
        "lat": 26.8780, "lng": 80.9620
    }
]

# Quick lookup by ward number
WARD_BY_NUMBER: Dict[int, Dict[str, Any]] = {w["ward_no"]: w for w in LUCKNOW_WARDS}

# Zone names & descriptors
ZONE_DETAILS: Dict[int, Dict[str, str]] = {
    1: {"name": "Zone 1 (Central / Kaiserbagh / Hazratganj)", "zone_id": "Zone-1", "hq": "Kaiserbagh Zonal Office", "wards_count": 14},
    2: {"name": "Zone 2 (Old City / Charbagh / Rajajipuram)", "zone_id": "Zone-2", "hq": "Aishbagh Zonal Office", "wards_count": 10},
    3: {"name": "Zone 3 (North / Aliganj / Jankipuram / Mahanagar)", "zone_id": "Zone-3", "hq": "Aliganj Zonal Office", "wards_count": 21},
    4: {"name": "Zone 4 (East / Gomti Nagar / Chinhat)", "zone_id": "Zone-4", "hq": "Gomti Nagar Zonal Office", "wards_count": 11},
    5: {"name": "Zone 5 (South-West / Alambagh / Transport Nagar)", "zone_id": "Zone-5", "hq": "Alambagh Zonal Office", "wards_count": 10},
    6: {"name": "Zone 6 (West / Chowk / Thakurganj / Saadatganj)", "zone_id": "Zone-6", "hq": "Chowk Zonal Office", "wards_count": 22},
    7: {"name": "Zone 7 (North-East / Indira Nagar)", "zone_id": "Zone-7", "hq": "Indira Nagar Zonal Office", "wards_count": 10},
    8: {"name": "Zone 8 (South / Ashiyana / Telibagh / Sharda Nagar)", "zone_id": "Zone-8", "hq": "Ashiyana Zonal Office", "wards_count": 12},
}

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in km between two lat/lng coordinates."""
    R = 6371.0  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def find_ward_by_text(text: str) -> Optional[Dict[str, Any]]:
    """
    Search for matching ward based on address/locality text string.
    Performs score-weighted keyword matching.
    """
    if not text:
        return None

    clean_text = text.lower()
    best_ward = None
    best_score = 0

    for ward in LUCKNOW_WARDS:
        score = 0
        # Check ward name
        w_name = ward["ward_name"].lower()
        if w_name in clean_text:
            score += 15
        
        # Check parts of ward name
        for token in w_name.replace("-", " ").split():
            if len(token) > 3 and token in clean_text:
                score += 4

        # Check key localities and landmarks
        for loc in ward["key_localities"]:
            loc_lower = loc.lower()
            if loc_lower in clean_text:
                # Give higher weight to multi-word specific landmarks
                score += 10 if " " in loc_lower else 6
            else:
                for token in loc_lower.replace("-", " ").split():
                    if len(token) > 3 and token in clean_text:
                        score += 3

        if score > best_score:
            best_score = score
            best_ward = ward

    if best_score >= 6:
        return best_ward
    return None

def find_ward_by_coordinates(lat: float, lng: float) -> Dict[str, Any]:
    """
    Find the closest ward based on geographic coordinates (Euclidean/Haversine distance).
    """
    closest_ward = LUCKNOW_WARDS[0]
    min_dist = float("inf")

    for ward in LUCKNOW_WARDS:
        dist = haversine_distance(lat, lng, ward["lat"], ward["lng"])
        if dist < min_dist:
            min_dist = dist
            closest_ward = ward

    return closest_ward

def assign_ward_and_zone(
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    address_text: Optional[str] = None,
    landmark_text: Optional[str] = None
) -> Dict[str, Any]:
    """
    Given coordinates and/or reverse-geocoded address/landmark, resolve the exact
    Lucknow Municipal Corporation Ward (1-110) and Zone (1-8).
    
    Resolution strategy:
    1. First check if reverse-geocoded address or landmark matches known key localities / ward names.
    2. If text match is weak or ambiguous and valid coordinates are provided, find the closest ward by coordinates.
    3. If coordinates are outside Lucknow or unavailable and no text matched, fallback to default Gomti Nagar / Zone-4.
    """
    combined_text = f"{landmark_text or ''} {address_text or ''}".strip()
    
    # 1. Try text match first
    ward = find_ward_by_text(combined_text) if combined_text else None
    resolution_method = "text_match" if ward else None

    # 2. If no confident text match, use coordinates
    if not ward and lat is not None and lng is not None:
        # Check if coordinates are reasonably in/around Lucknow area (lat: 26.5 to 27.2, lng: 80.6 to 81.3)
        if 26.5 <= lat <= 27.2 and 80.6 <= lng <= 81.3:
            ward = find_ward_by_coordinates(lat, lng)
            resolution_method = "coordinate_proximity"

    # 3. Fallback to default Gomti Nagar (Ward 37, Zone 4) if completely unidentified
    if not ward:
        ward = WARD_BY_NUMBER[37]  # Gomti Nagar
        resolution_method = "default_fallback"

    zone_info = ZONE_DETAILS.get(ward["zone_no"], {
        "name": f"Zone {ward['zone_no']}",
        "zone_id": f"Zone-{ward['zone_no']}",
        "hq": "Zonal Municipal Office",
        "wards_count": 10
    })

    return {
        "ward_no": ward["ward_no"],
        "ward_id": f"Ward-{ward['ward_no']}",
        "ward_name": ward["ward_name"],
        "zone_no": ward["zone_no"],
        "zone_id": ward["zone_id"],
        "zone_name": zone_info["name"],
        "zone_hq": zone_info["hq"],
        "vidhan_sabha": ward["vidhan_sabha"],
        "key_localities": ward["key_localities"],
        "resolution_method": resolution_method,
        "matched_ward_center": {"lat": ward["lat"], "lng": ward["lng"]}
    }
