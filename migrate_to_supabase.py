"""
migrate_to_supabase.py — Migration Tool
----------------------------------------
Connects to local SQLite database (reports.db), creates corresponding
schemas in your Supabase PostgreSQL database, and copies all data.
Also resets primary key sequences so auto-increment IDs continue smoothly.

Usage:
    venv/Scripts/python migrate_to_supabase.py
"""

import os
import sqlite3
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

load_dotenv()

SUPABASE_DB_URL = os.environ.get("SUPABASE_DB_URL")
SQLITE_DB_PATH = "reports.db"

def run_migration():
    if not SUPABASE_DB_URL:
        print("Error: SUPABASE_DB_URL environment variable is not set.")
        print("Please configure .env with your PostgreSQL connection string first.")
        return

    print("Connecting to SQLite (local) and Supabase (Postgres)...")
    try:
        lite_conn = sqlite3.connect(SQLITE_DB_PATH)
        lite_cur = lite_conn.cursor()

        pg_conn = psycopg2.connect(SUPABASE_DB_URL)
        pg_cur = pg_conn.cursor()
    except Exception as e:
        print(f"Connection error: {e}")
        return

    # =====================================================
    # 1. CREATE TABLES IN POSTGRES
    # =====================================================
    print("\nCreating table schemas in Supabase PostgreSQL...")

    create_officers = """
    CREATE TABLE IF NOT EXISTS officers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        profile_image_url TEXT,
        officer_id TEXT UNIQUE NOT NULL,
        designation TEXT,
        department TEXT,
        zone_id TEXT,
        ward_id TEXT,
        role TEXT DEFAULT 'Ward Officer',
        status TEXT DEFAULT 'Active',
        password TEXT,
        created_at TEXT,
        updated_at TEXT,
        last_login_at TEXT
    );
    """

    create_workers = """
    CREATE TABLE IF NOT EXISTS workers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        worker_id TEXT UNIQUE NOT NULL,
        department TEXT NOT NULL,
        password TEXT NOT NULL,
        created_at TEXT
    );
    """

    create_reports = """
    CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        image_path TEXT NOT NULL,
        summary TEXT,
        severity TEXT,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        created_at TEXT,
        feedback TEXT DEFAULT NULL,
        type TEXT DEFAULT 'image',
        department TEXT DEFAULT 'General',
        avg_confidence DOUBLE PRECISION DEFAULT NULL,
        latency_ms DOUBLE PRECISION DEFAULT NULL,
        class_confidences TEXT DEFAULT NULL,
        report_number TEXT DEFAULT NULL,
        citizen_id TEXT DEFAULT 'CIT-1001',
        issue_type TEXT DEFAULT 'Civic Issue',
        description TEXT DEFAULT NULL,
        status TEXT DEFAULT 'Pending',
        address TEXT DEFAULT NULL,
        landmark TEXT DEFAULT NULL,
        zone_id TEXT DEFAULT 'Zone-4 (North)',
        ward_id TEXT DEFAULT 'Ward-12',
        assigned_officer_id INTEGER DEFAULT 1,
        updated_at TEXT DEFAULT NULL
    );
    """

    create_report_images = """
    CREATE TABLE IF NOT EXISTS report_images (
        id SERIAL PRIMARY KEY,
        report_id INTEGER NOT NULL,
        storage_path TEXT NOT NULL,
        public_or_signed_url TEXT NOT NULL,
        file_name TEXT,
        mime_type TEXT,
        file_size INTEGER,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        captured_at TEXT,
        uploaded_at TEXT,
        FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
    );
    """

    try:
        pg_cur.execute(create_officers)
        pg_cur.execute(create_workers)
        pg_cur.execute(create_reports)
        pg_cur.execute(create_report_images)
        pg_conn.commit()
        print("Schemas verified and created successfully.")
    except Exception as e:
        print(f"Schema creation error: {e}")
        pg_conn.rollback()
        return

    # =====================================================
    # 2. COPY DATA FOR EACH TABLE
    # =====================================================
    tables = ["officers", "workers", "reports", "report_images"]

    for table in tables:
        print(f"\nMigrating table: {table}...")
        
        # Get column names
        lite_cur.execute(f"PRAGMA table_info({table})")
        columns = [col[1] for col in lite_cur.fetchall()]
        cols_str = ", ".join(columns)
        placeholders = ", ".join(["%s"] * len(columns))

        # Fetch SQLite data
        lite_cur.execute(f"SELECT {cols_str} FROM {table}")
        rows = lite_cur.fetchall()

        if not rows:
            print(f"Table {table} is empty. Skipping data copy.")
            continue

        # Insert to Postgres
        pg_cur.execute(f"DELETE FROM {table}") # Clear existing rows to prevent conflicts
        
        insert_query = f"INSERT INTO {table} ({cols_str}) VALUES ({placeholders})"
        try:
            pg_cur.executemany(insert_query, rows)
            pg_conn.commit()
            print(f"Successfully copied {len(rows)} records into {table}.")
            
            # Reset postgres SERIAL sequence so it starts after max ID
            seq_reset_query = f"""
            SELECT setval(
                pg_get_serial_sequence('{table}', 'id'),
                COALESCE(MAX(id), 1),
                MAX(id) IS NOT NULL
            ) FROM {table};
            """
            pg_cur.execute(seq_reset_query)
            pg_conn.commit()
            print(f"Reset sequence for {table}.")
        except Exception as e:
            print(f"Failed to copy records for {table}: {e}")
            pg_conn.rollback()
            return

    lite_conn.close()
    pg_conn.close()
    print("\nSupabase Database Migration Complete!")

if __name__ == "__main__":
    run_migration()
