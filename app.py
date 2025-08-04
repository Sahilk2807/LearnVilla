# learn-villa/app.py
import os
import sqlite3
from functools import wraps
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from flask import (Flask, render_template, request, jsonify, session,
                   redirect, url_for, g)

# --- App Configuration ---
app = Flask(__name__)
app.config['SECRET_KEY'] = 'a-super-secret-key-that-is-long-and-random'
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['DATABASE'] = 'data/database.db'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg'}

# --- Create upload folders if they don't exist ---
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'courses'))

# --- Database Helper ---
def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(
            app.config['DATABASE'],
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

# --- Auth Decorators ---
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'status': 'error', 'message': 'Login required'}), 401
        return f(*args, **kwargs)

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('is_admin'):
            return jsonify({'status': 'error', 'message': 'Admin access required'}), 403
        return f(*args, **kwargs)

# --- Main App Routes (Serving the SPA Shell) ---
@app.route('/')
def user_shell():
    if 'user_id' in session:
        return render_template('user/layout.html')
    return render_template('user/layout.html', initial_page="login")

@app.route('/admin')
def admin_shell():
    if session.get('is_admin'):
        return render_template('admin/layout.html')
    return redirect(url_for('user_shell'))

# --- AJAX Page Content API ---
@app.route('/api/page/<path:page_name>')
def get_page_content(page_name):
    db = get_db()
    
    # --- User Pages ---
    if page_name == 'index':
        courses = db.execute('SELECT * FROM courses ORDER BY created_at DESC LIMIT 10').fetchall()
        return render_template('user/index.html', courses=courses)
    
    elif page_name.startswith('course/'):
        course_id = page_name.split('/')[-1]
        course = db.execute('SELECT * FROM courses WHERE id = ?', (course_id,)).fetchone()
        
        # Check if course is in user's wishlist
        is_in_wishlist = False
        if 'user_id' in session:
            wishlist_item = db.execute(
                'SELECT id FROM wishlist WHERE user_id = ? AND course_id = ?',
                (session['user_id'], course_id)
            ).fetchone()
            is_in_wishlist = wishlist_item is not None

        return render_template('user/course_detail.html', course=course, is_in_wishlist=is_in_wishlist)
        
    elif page_name.startswith('watch/'):
        # ... (same as before) ...
        return render_template('user/watch.html')

    elif page_name == 'login':
        return render_template('user/login.html')

    elif page_name == 'mycourses':
        # This page requires login
        if 'user_id' not in session: return render_template('user/login.html')
        # Placeholder logic: in a real app, query the 'enrollments' table
        courses = db.execute('SELECT * FROM courses ORDER BY RANDOM() LIMIT 3').fetchall()
        return render_template('user/mycourses.html', courses=courses)
        
    elif page_name == 'wishlist':
        if 'user_id' not in session: return render_template('user/login.html')
        user_id = session['user_id']
        courses = db.execute('''
            SELECT c.* FROM courses c JOIN wishlist w ON c.id = w.course_id
            WHERE w.user_id = ?
        ''', (user_id,)).fetchall()
        return render_template('user/wishlist.html', courses=courses)

    # --- Admin Pages ---
    elif page_name == 'admin/dashboard':
        # ... (same as before) ...
        return render_template('admin/dashboard.html')
        
    elif page_name == 'admin/courses':
        # ... (same as before) ...
        return render_template('admin/course.html')

    elif page_name == 'admin/users':
        if not session.get('is_admin'): return "Access Denied", 403
        users = db.execute('SELECT id, name, email, created_at FROM users').fetchall()
        return render_template('admin/users.html', users=users)

    return "Page not found", 404

# --- Authentication API ---
# ... (api_login, api_signup, logout are the same as before) ...
@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    identifier = data.get('identifier')
    password = data.get('password')
    db = get_db()
    admin = db.execute('SELECT * FROM admin WHERE username = ?', (identifier,)).fetchone()
    if admin and check_password_hash(admin['password'], password):
        session.clear()
        session['is_admin'] = True
        session['admin_id'] = admin['id']
        session['admin_name'] = admin['username']
        return jsonify({'status': 'success', 'redirect': '/admin'})
    user = db.execute('SELECT * FROM users WHERE email = ?', (identifier,)).fetchone()
    if user and check_password_hash(user['password'], password):
        session.clear()
        session['user_id'] = user['id']
        session['user_name'] = user['name']
        return jsonify({'status': 'success', 'redirect': '/'})
    return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401

@app.route('/api/signup', methods=['POST'])
def api_signup():
    data = request.get_json()
    name, email, password = data.get('name'), data.get('email'), data.get('password')
    if not all([name, email, password]): return jsonify({'status': 'error', 'message': 'All fields are required'}), 400
    db = get_db()
    if db.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone(): return jsonify({'status': 'error', 'message': 'Email already exists'}), 409
    hashed_password = generate_password_hash(password)
    db.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', (name, email, hashed_password))
    db.commit()
    return jsonify({'status': 'success', 'message': 'Signup successful! Please log in.'})

@app.route('/api/logout')
def logout():
    session.clear()
    return redirect(url_for('user_shell'))

# --- Wishlist API ---
@app.route('/api/wishlist/toggle', methods=['POST'])
@login_required
def toggle_wishlist():
    data = request.get_json()
    course_id = data.get('course_id')
    user_id = session['user_id']
    db = get_db()

    existing = db.execute(
        'SELECT id FROM wishlist WHERE user_id = ? AND course_id = ?',
        (user_id, course_id)
    ).fetchone()

    if existing:
        db.execute('DELETE FROM wishlist WHERE id = ?', (existing['id'],))
        db.commit()
        return jsonify({'status': 'success', 'added': False, 'message': 'Removed from Wishlist'})
    else:
        db.execute('INSERT INTO wishlist (user_id, course_id) VALUES (?, ?)', (user_id, course_id))
        db.commit()
        return jsonify({'status': 'success', 'added': True, 'message': 'Added to Wishlist'})

# --- Admin Course Management API ---
# ... (same as before) ...
@app.route('/api/admin/courses', methods=['POST'])
@admin_required
def add_course():
    if 'image' not in request.files: return jsonify({'status': 'error', 'message': 'No image part'}), 400
    file = request.files['image']
    if file.filename == '': return jsonify({'status': 'error', 'message': 'No selected file'}), 400
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'courses', filename)
    file.save(filepath)
    db = get_db()
    db.execute('INSERT INTO courses (title, description, price, mrp, image) VALUES (?, ?, ?, ?, ?)',(request.form['title'], request.form['description'], request.form['price'], request.form['mrp'], filename))
    db.commit()
    return jsonify({'status': 'success', 'message': 'Course added successfully'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)