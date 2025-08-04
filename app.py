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
    
    # User Pages
    if page_name == 'index':
        courses = db.execute('SELECT * FROM courses ORDER BY created_at DESC LIMIT 10').fetchall()
        return render_template('user/index.html', courses=courses)
    
    elif page_name.startswith('course/'):
        course_id = page_name.split('/')[-1]
        course = db.execute('SELECT * FROM courses WHERE id = ?', (course_id,)).fetchone()
        chapters = db.execute('SELECT * FROM chapters WHERE course_id = ? ORDER BY id', (course_id,)).fetchall()
        return render_template('user/course_detail.html', course=course, chapters=chapters)
        
    elif page_name.startswith('watch/'):
        course_id = page_name.split('/')[-1]
        # In a real app, first check if user is enrolled
        course = db.execute('SELECT * FROM courses WHERE id = ?', (course_id,)).fetchone()
        chapters = db.execute('SELECT * FROM chapters WHERE course_id = ? ORDER BY id', (course_id,)).fetchall()
        return render_template('user/watch.html', course=course, chapters=chapters)

    elif page_name == 'login':
        return render_template('user/login.html')
        
    # Admin Pages
    elif page_name == 'admin/dashboard':
        user_count = db.execute('SELECT COUNT(id) FROM users').fetchone()[0]
        course_count = db.execute('SELECT COUNT(id) FROM courses').fetchone()[0]
        return render_template('admin/dashboard.html', user_count=user_count, course_count=course_count)
        
    elif page_name == 'admin/courses':
        courses = db.execute('SELECT * FROM courses ORDER BY created_at DESC').fetchall()
        return render_template('admin/course.html', courses=courses)

    return "Page not found", 404

# --- Authentication API ---
@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    identifier = data.get('identifier') # Can be username (for admin) or email (for user)
    password = data.get('password')
    db = get_db()

    # Check if admin
    admin = db.execute('SELECT * FROM admin WHERE username = ?', (identifier,)).fetchone()
    if admin and check_password_hash(admin['password'], password):
        session.clear()
        session['is_admin'] = True
        session['admin_id'] = admin['id']
        session['admin_name'] = admin['username']
        return jsonify({'status': 'success', 'redirect': '/admin'})

    # Check if user
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
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    if not all([name, email, password]):
        return jsonify({'status': 'error', 'message': 'All fields are required'}), 400

    db = get_db()
    if db.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone():
        return jsonify({'status': 'error', 'message': 'Email already exists'}), 409
        
    hashed_password = generate_password_hash(password)
    db.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', (name, email, hashed_password))
    db.commit()
    return jsonify({'status': 'success', 'message': 'Signup successful! Please log in.'})

@app.route('/api/logout')
def logout():
    session.clear()
    return redirect(url_for('user_shell'))

# --- Admin Course Management API ---
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/api/admin/courses', methods=['POST'])
@admin_required
def add_course():
    if 'image' not in request.files:
        return jsonify({'status': 'error', 'message': 'No image part'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'status': 'error', 'message': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'courses', filename)
        file.save(filepath)
        
        db = get_db()
        db.execute(
            'INSERT INTO courses (title, description, price, mrp, image) VALUES (?, ?, ?, ?, ?)',
            (request.form['title'], request.form['description'], request.form['price'], request.form['mrp'], filename)
        )
        db.commit()
        return jsonify({'status': 'success', 'message': 'Course added successfully'})
    else:
        return jsonify({'status': 'error', 'message': 'File type not allowed'}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)