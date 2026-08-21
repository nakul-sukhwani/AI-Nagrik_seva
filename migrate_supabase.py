import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
db_url = os.environ.get('SUPABASE_DB_URL')

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    # Check existing columns in reports table
    cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'reports'")
    columns = [row[0] for row in cur.fetchall()]

    new_cols = [
        ('type', "TEXT DEFAULT 'image'"),
        ('feedback', "TEXT DEFAULT NULL"),
        ('department', "TEXT DEFAULT 'General'"),
        ('avg_confidence', "REAL DEFAULT NULL"),
        ('latency_ms', "REAL DEFAULT NULL"),
        ('class_confidences', "TEXT DEFAULT NULL"),
        ('report_number', "TEXT DEFAULT NULL"),
        ('citizen_id', "TEXT DEFAULT 'CIT-1001'"),
        ('issue_type', "TEXT DEFAULT 'Civic Issue'"),
        ('description', "TEXT DEFAULT NULL"),
        ('status', "TEXT DEFAULT 'Pending'"),
        ('address', "TEXT DEFAULT NULL"),
        ('landmark', "TEXT DEFAULT NULL"),
        ('zone_id', "TEXT DEFAULT 'Zone-4 (North)'"),
        ('ward_id', "TEXT DEFAULT 'Ward-12'"),
        ('assigned_officer_id', "INTEGER DEFAULT 1"),
        ('updated_at', "TEXT DEFAULT NULL"),
        ('upvotes', "INTEGER DEFAULT 1"),
        ('is_escalated', "BOOLEAN DEFAULT FALSE"),
        ('materials_needed', "TEXT DEFAULT NULL"),
        ('manpower_estimate', "TEXT DEFAULT NULL"),
        ('impact_reasoning', "TEXT DEFAULT NULL"),
        ('estimated_affected_people', "TEXT DEFAULT NULL"),
        ('scale', "TEXT DEFAULT NULL"),
        ('severity_level', "TEXT DEFAULT NULL")
    ]

    for col_name, col_def in new_cols:
        if col_name not in columns:
            print(f"Adding '{col_name}' column to Supabase reports...")
            # For Postgres, boolean default needs to be FALSE not 0
            if 'BOOLEAN' in col_def and '0' in col_def:
                col_def = col_def.replace('0', 'FALSE')
            cur.execute(f"ALTER TABLE reports ADD COLUMN {col_name} {col_def}")

    conn.commit()
    print('Migration complete!')
except Exception as e:
    print('Error:', e)
