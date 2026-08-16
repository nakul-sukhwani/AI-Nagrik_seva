import sqlite3
import os
import sys
from pathlib import Path
from werkzeug.security import generate_password_hash

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "reports.db"

import supabase_client

def seed_data():
    # Use supabase_client to get the connection, routing to Supabase or local SQLite automatically
    conn = supabase_client.get_db_connection(DB_PATH)
    cur = conn.cursor()

    print("Seeding demo officer...")
    try:
        # Seed demo officer if empty
        cur.execute("SELECT COUNT(*) FROM officers")
        if cur.fetchone()[0] == 0:
            cur.execute("""
                INSERT INTO officers (name, email, phone, profile_image_url, officer_id, designation, department, zone_id, ward_id, role, status, password, created_at, updated_at, last_login_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))
            """, (
                'Rajesh Kumar (DEMO)',
                'officer.rajesh@nagrikseva.gov.in',
                '+91 98765 43210',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                'OFF-2026-001',
                'Senior Ward Officer',
                'Roads & Sanitation',
                'Zone-4 (North)',
                'Ward-12',
                'Ward Officer',
                'Active',
                generate_password_hash('admin123')
            ))
            print("Demo officer created.")
        else:
            # Update existing demo officer password if null or empty
            cur.execute("""
                UPDATE officers 
                SET password = ? 
                WHERE officer_id = 'OFF-2026-001' AND (password IS NULL OR password = '')
            """, (generate_password_hash('admin123'),))
            print("Demo officer already exists (password updated if it was missing).")
            
    except Exception as e:
        print(f"Error seeding officer: {e}")

    print("Seeding demo worker...")
    try:
        # Seed demo worker if empty
        cur.execute("SELECT COUNT(*) FROM workers")
        if cur.fetchone()[0] == 0:
            cur.execute("""
                INSERT INTO workers (name, email, worker_id, department, password, created_at)
                VALUES (?, ?, ?, ?, ?, datetime('now'))
            """, (
                'Amit Sharma (DEMO)',
                'worker.amit@smartcity.gov.in',
                'WRK-2026-001',
                'Roads Department',
                generate_password_hash('worker123')
            ))
            print("Demo worker created.")
        else:
            print("Demo worker already exists.")
    except Exception as e:
        print(f"Error seeding worker: {e}")

    conn.commit()
    conn.close()
    print("Seeding complete.")

if __name__ == "__main__":
    seed_data()
