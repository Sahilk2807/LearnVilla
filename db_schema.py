# learn-villa/db_schema.py
import sqlite3
import os
from werkzeug.security import generate_password_hash

# --- Configuration ---
DB_FILE = 'data/database.db'
DB_FOLDER = 'data'

def init_db():
    # --- Create Folders if they don't exist ---
    if not os.path.exists(DB_FOLDER):
        os.makedirs(DB_FOLDER)
    
    # --- Connect and create tables ---
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    print("Setting up database schema...")

    # --- Drop existing tables for a clean slate ---
    cursor.executescript('''
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS courses;
        DROP TABLE IF EXISTS chapters;
        DROP TABLE IF EXISTS enrollments;
        DROP TABLE IF EXISTS admin;
    ''')

    # --- Create users table ---
    cursor.execute('''
    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    print("Created 'users' table.")

    # --- Create admin table ---
    cursor.execute('''
    CREATE TABLE admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )
    ''')
    print("Created 'admin' table.")

    # --- Create courses table ---
    cursor.execute('''
    CREATE TABLE courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        mrp REAL NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    print("Created 'courses' table.")
    
    # --- Create chapters table ---
    cursor.execute('''
    CREATE TABLE chapters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER,
        title TEXT NOT NULL,
        video_url TEXT,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    )
    ''')
    print("Created 'chapters' table.")

    # --- Create enrollments table (to track user purchases) ---
    cursor.execute('''
    CREATE TABLE enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        course_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (course_id) REFERENCES courses(id)
    )
    ''')
    print("Created 'enrollments' table.")

    # --- Insert Default Admin User ---
    admin_pass_hash = generate_password_hash('admin')
    cursor.execute(
        'INSERT INTO admin (username, password) VALUES (?, ?)',
        ('admin', admin_pass_hash)
    )
    print("Inserted default admin user (username: admin, password: admin)")

    conn.commit()
    conn.close()
    print("Database initialized successfully.")

if __name__ == '__main__':
    init_db()