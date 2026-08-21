"""
supabase_client.py — Supabase Client and Database Wrapper
----------------------------------------------------------
Provides a unified interface to interact with Supabase (PostgreSQL & Storage),
with a transparent fallback to local SQLite and file storage if environment
variables are missing.

This enables a "dual-mode" architecture, allowing the application to be tested
locally without any cloud dependencies, while scaling up to Supabase seamlessly.
"""

import os
import shutil
import tempfile
import sqlite3
import urllib.parse
from datetime import datetime
from dotenv import load_dotenv

# Store original sqlite3.connect to prevent recursion when overridden
_original_sqlite_connect = sqlite3.connect

# Load environment variables from .env file
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
SUPABASE_DB_URL = os.environ.get("SUPABASE_DB_URL")

# Separate flags for DB vs Storage — allows Storage to work even without a DB URL
IS_SUPABASE_DB_ACTIVE = bool(SUPABASE_URL and SUPABASE_KEY and SUPABASE_DB_URL)
IS_SUPABASE_STORAGE_ACTIVE = bool(SUPABASE_URL and SUPABASE_KEY)

# IS_SUPABASE_ACTIVE kept for backward compatibility (True only when DB is also active)
IS_SUPABASE_ACTIVE = IS_SUPABASE_DB_ACTIVE

if IS_SUPABASE_DB_ACTIVE:
    import psycopg2
    from supabase import create_client, Client
    print("Supabase integration is ACTIVE (PostgreSQL + Cloud Storage).")
    supabase_sdk: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
elif IS_SUPABASE_STORAGE_ACTIVE:
    # Only Storage is available (no DB URL configured) — use SQLite for DB
    try:
        from supabase import create_client, Client
        supabase_sdk: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Supabase STORAGE is ACTIVE (Cloud image uploads enabled). DB using SQLite fallback.")
    except Exception as e:
        supabase_sdk = None
        print(f"Supabase SDK init failed: {e}. Storage unavailable.")
else:
    supabase_sdk = None
    print("Supabase credentials missing. Falling back to local SQLite & file storage.")


# =====================================================
# DATABASE ROW WRAPPER
# Maps SQLite3 Row-like behavior for PostgreSQL dictionary results.
# Supports index access: row[0], and name-based access: row['id'].
# =====================================================

class RowWrapper:
    def __init__(self, data, description):
        self._data = data  # tuple of values
        # Map column name to index
        self._mapping = {desc[0]: i for i, desc in enumerate(description)}
        self._keys = [desc[0] for desc in description]

    def keys(self):
        return self._keys

    def values(self):
        return list(self._data)

    def items(self):
        return [(k, self[k]) for k in self._keys]

    def __getitem__(self, key):
        if isinstance(key, int):
            return self._data[key]
        if isinstance(key, str):
            if key in self._mapping:
                return self._data[self._mapping[key]]
            raise KeyError(f"Column '{key}' not found in row.")
        raise TypeError("Indices must be integers or strings.")

    def get(self, key, default=None):
        try:
            return self[key]
        except KeyError:
            return default

    def __len__(self):
        return len(self._data)

    def __iter__(self):
        return iter(self._data)

    def __repr__(self):
        d = {k: self[k] for k in self._keys}
        return f"<RowWrapper {d}>"


# =====================================================
# SQL COMPATIBILITY WRAPPER (SQLite3 -> PostgreSQL)
# Converts:
# 1. '?' placeholders to '%s'
# 2. 'datetime("now")' or "datetime('now')" to 'CURRENT_TIMESTAMP'
# 3. Implements 'lastrowid' via insert interceptions with 'RETURING id'
# =====================================================

class CursorWrapper:
    def __init__(self, real_cursor):
        self.cursor = real_cursor
        self.lastrowid = None

    def execute(self, query, params=None):
        # 1. Translate sqlite3 query format to pgsql
        translated_query = query
        
        # Translate placeholders: ? -> %s
        # (Be careful not to replace literal question marks inside strings,
        # but none of our app's queries have actual text question marks)
        translated_query = translated_query.replace('?', '%s')

        # Translate SQLite datetime functions
        translated_query = translated_query.replace("datetime('now')", "CURRENT_TIMESTAMP")
        translated_query = translated_query.replace('datetime("now")', 'CURRENT_TIMESTAMP')

        # 2. Implement lastrowid support for INSERT queries
        is_insert = translated_query.strip().upper().startswith("INSERT")
        
        if is_insert and "RETURNING" not in translated_query.upper():
            # Append RETURNING id to capture lastrowid
            translated_query = translated_query.rstrip().rstrip(';') + " RETURNING id"

        # 3. Execute
        if params is not None:
            # psycopg2 expects tuples or dicts, if list passed, convert to tuple
            if isinstance(params, list):
                params = tuple(params)
            self.cursor.execute(translated_query, params)
        else:
            self.cursor.execute(translated_query)

        # Fetch lastrowid if needed
        if is_insert:
            try:
                row = self.cursor.fetchone()
                if row:
                    self.lastrowid = row[0]
            except Exception:
                pass

        return self

    def fetchone(self):
        row = self.cursor.fetchone()
        if row is None:
            return None
        return RowWrapper(row, self.cursor.description)

    def fetchall(self):
        rows = self.cursor.fetchall()
        description = self.cursor.description
        return [RowWrapper(r, description) for r in rows]

    @property
    def rowcount(self):
        return self.cursor.rowcount

    @property
    def description(self):
        return self.cursor.description

    def close(self):
        self.cursor.close()


class ConnectionWrapper:
    def __init__(self, real_conn):
        self.conn = real_conn
        self.row_factory = None  # Mock property to match sqlite3

    def cursor(self):
        return CursorWrapper(self.conn.cursor())

    def commit(self):
        self.conn.commit()

    def rollback(self):
        self.conn.rollback()

    def close(self):
        self.conn.close()


# =====================================================
# API CONNECTION DISPATCHER
# =====================================================

def _get_serverless_sqlite(original_db_path):
    """
    Creates a writable copy of the SQLite DB in /tmp for Vercel.
    """
    tmp_db_path = os.path.join(tempfile.gettempdir(), "reports.db")
    original_db_path_str = str(original_db_path)
    
    # Copy the bundled db to /tmp if it doesn't exist yet
    if not os.path.exists(tmp_db_path) and os.path.exists(original_db_path_str):
        try:
            shutil.copy2(original_db_path_str, tmp_db_path)
        except Exception as e:
            print(f"Failed to copy DB to /tmp: {e}")
            return _original_sqlite_connect(original_db_path_str)

    if os.path.exists(tmp_db_path):
        return _original_sqlite_connect(tmp_db_path)
    else:
        # Last resort: try original path (may fail on read-only FS)
        return _original_sqlite_connect(original_db_path_str)

def get_db_connection(db_path="reports.db"):
    """
    Get a database connection. Returns a ConnectionWrapper if
    connected to Supabase, otherwise a standard sqlite3 connection.
    """
    if IS_SUPABASE_ACTIVE:
        try:
            # Use connect_timeout=5 to avoid hanging in Vercel's 10s serverless limit
            conn = psycopg2.connect(SUPABASE_DB_URL, connect_timeout=5)
            return ConnectionWrapper(conn)
        except Exception as e:
            print(f"Supabase DB connection failed: {e}. Falling back to SQLite.")
            # Fall back to sqlite if DB_URL is broken, using serverless-safe /tmp
            return _get_serverless_sqlite(db_path)
    else:
        return _get_serverless_sqlite(db_path)


# =====================================================
# SUPABASE STORAGE HELPER
# =====================================================

def upload_image_to_supabase(file_bytes: bytes, filename: str, bucket_name: str = "reports") -> str:
    """
    Upload file bytes to a Supabase storage bucket.
    If Supabase is active, uploads and returns the local route that redirects to the bucket.
    If Supabase is inactive, raises an environment error.
    """
    if not IS_SUPABASE_ACTIVE:
        raise RuntimeError("Supabase is not configured.")

    try:
        # Upload using the Supabase SDK
        # content_type parameter is optional but recommended
        mime_type = "image/png" if filename.endswith(".png") else "image/jpeg"
        response = supabase_sdk.storage.from_(bucket_name).upload(
            path=filename,
            file=file_bytes,
            file_options={"content-type": mime_type}
        )
        
        # Return the clean path redirecting via Flask to the Supabase public URL
        # e.g., 'supabase/reports/filename.png'
        return f"supabase/{bucket_name}/{filename}"
    except Exception as e:
        print(f"Supabase storage upload failed: {e}")
        return None
