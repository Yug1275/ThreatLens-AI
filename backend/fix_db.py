import asyncio
import os
from dotenv import load_dotenv

# Load env vars
load_dotenv()

import psycopg2

DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/threatlens"
if not DATABASE_URL:
    print("DATABASE_URL not found in .env")
    exit(1)

print(f"Connecting to database to fix schema...")
try:
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cursor = conn.cursor()

    # Add missing columns to investigations
    columns_to_add = [
        "ALTER TABLE investigations ADD COLUMN IF NOT EXISTS name VARCHAR;",
        "ALTER TABLE investigations ADD COLUMN IF NOT EXISTS notes VARCHAR;",
        "ALTER TABLE investigations ADD COLUMN IF NOT EXISTS tags JSON;",
        "ALTER TABLE investigations ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE NOT NULL;",
        "ALTER TABLE investigations ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE NOT NULL;",
        "ALTER TABLE investigations ADD COLUMN IF NOT EXISTS folder_id VARCHAR;",
        "ALTER TABLE investigations ADD COLUMN IF NOT EXISTS workflow_status VARCHAR DEFAULT 'NEW' NOT NULL;"
    ]

    for stmt in columns_to_add:
        print(f"Executing: {stmt}")
        try:
            cursor.execute(stmt)
        except Exception as e:
            print(f"Error executing {stmt}: {e}")

    print("Successfully added missing columns to investigations table!")
    
    # Let's also check if workspace_folders exists
    try:
        cursor.execute("SELECT 1 FROM workspace_folders LIMIT 1;")
    except psycopg2.errors.UndefinedTable:
        print("workspace_folders table doesn't exist. Creating it...")
        # Start a new transaction since the previous one aborted
        conn.rollback()
        conn.autocommit = True
        cursor.execute("""
            CREATE TABLE workspace_folders (
                id VARCHAR PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                name VARCHAR NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE,
                updated_at TIMESTAMP WITH TIME ZONE
            );
        """)
        print("Created workspace_folders table.")

    cursor.close()
    conn.close()
    print("Database schema fix complete!")
except Exception as e:
    print(f"Failed to connect or update DB: {e}")
