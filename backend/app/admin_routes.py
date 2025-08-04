from flask import Blueprint, jsonify, request
from app.models import Course, Lesson, User
from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps
from . import db

# Blueprint for all admin-related routes
admin_bp = Blueprint('admin', __name__)

# -------------------------------------
# --- Admin Protection Decorator ---
# -------------------------------------

def admin_required():
    """
    A decorator to protect routes, ensuring only users with 'is_admin'=True can access them.
    """
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):
            current_user = get_jwt_identity()
            if not current_user or not current_user.get('is_admin'):
                return jsonify(msg="Admins only! Access denied."), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

# -------------------------------------
# --- Admin Dashboard Routes ---
# -------------------------------------

@admin_bp.route('/stats', methods=['GET'])
@admin_required()
def get_stats():
    """Returns key statistics for the admin dashboard."""
    user_count = User.query.count()
    course_count = Course.query.count()
    return jsonify({'total_users': user_count, 'total_courses': course_count})

# -------------------------------------
# --- Course Management (CRUD) ---
# -------------------------------------

@admin_bp.route('/courses', methods=['POST'])
@admin_required()
def create_course():
    """Creates a new course."""
    data = request.get_json()
    new_course = Course(
        title=data['title'],
        description=data['description'],
        poster_url=data.get('poster_url', ''),
        category=data['category'],
        featured=data.get('featured', False)
    )
    db.session.add(new_course)
    db.session.commit()
    return jsonify({'id': new_course.id, 'message': 'Course created successfully'}), 201

@admin_bp.route('/courses', methods=['GET'])
@admin_required()
def get_all_courses_admin():
    """Gets a list of all courses for the admin panel."""
    courses = Course.query.order_by(Course.id.desc()).all()
    return jsonify([{
        'id': c.id, 'title': c.title, 'category': c.category, 'featured': c.featured, 'lesson_count': len(c.lessons)
    } for c in courses])

@admin_bp.route('/courses/<int:course_id>', methods=['GET'])
@admin_required()
def get_course_admin(course_id):
    """Gets full details for a single course for editing."""
    course = Course.query.get_or_404(course_id)
    return jsonify({
        'id': course.id, 'title': course.title, 'description': course.description,
        'poster_url': course.poster_url, 'category': course.category, 'featured': course.featured,
        'lessons': [{
            'id': l.id, 'title': l.title, 'content_type': l.content_type.value,
            'content_url': l.content_url, 'is_premium': l.is_premium
        } for l in course.lessons]
    })

@admin_bp.route('/courses/<int:course_id>', methods=['PUT'])
@admin_required()
def update_course(course_id):
    """Updates an existing course's details."""
    course = Course.query.get_or_404(course_id)
    data = request.get_json()
    course.title = data.get('title', course.title)
    course.description = data.get('description', course.description)
    course.poster_url = data.get('poster_url', course.poster_url)
    course.category = data.get('category', course.category)
    course.featured = data.get('featured', course.featured)
    db.session.commit()
    return jsonify({'message': 'Course updated successfully'})

@admin_bp.route('/courses/<int:course_id>', methods=['DELETE'])
@admin_required()
def delete_course(course_id):
    """Deletes a course and all its associated lessons."""
    course = Course.query.get_or_404(course_id)
    # The `cascade="all, delete-orphan"` in the model handles lesson deletion
    db.session.delete(course)
    db.session.commit()
    return jsonify({'message': 'Course deleted successfully'})

# -------------------------------------
# --- Lesson Management (CRUD) ---
# -------------------------------------

@admin_bp.route('/courses/<int:course_id>/lessons', methods=['POST'])
@admin_required()
def add_lesson_to_course(course_id):
    """Adds a new lesson to a specific course."""
    Course.query.get_or_404(course_id) # Ensure course exists
    data = request.get_json()
    new_lesson = Lesson(
        title=data['title'],
        content_type=data['content_type'], # 'video' or 'pdf'
        content_url=data['content_url'],
        is_premium=data.get('is_premium', True),
        course_id=course_id
    )
    db.session.add(new_lesson)
    db.session.commit()
    return jsonify({'id': new_lesson.id, 'message': 'Lesson added successfully'}), 201

@admin_bp.route('/lessons/<int:lesson_id>', methods=['PUT'])
@admin_required()
def update_lesson(lesson_id):
    """Updates an existing lesson's details."""
    lesson = Lesson.query.get_or_404(lesson_id)
    data = request.get_json()
    lesson.title = data.get('title', lesson.title)
    lesson.content_type = data.get('content_type', lesson.content_type.value)
    lesson.content_url = data.get('content_url', lesson.content_url)
    lesson.is_premium = data.get('is_premium', lesson.is_premium)
    db.session.commit()
    return jsonify({'message': 'Lesson updated successfully'})

@admin_bp.route('/lessons/<int:lesson_id>', methods=['DELETE'])
@admin_required()
def delete_lesson(lesson_id):
    """Deletes a single lesson."""
    lesson = Lesson.query.get_or_404(lesson_id)
    db.session.delete(lesson)
    db.session.commit()
    return jsonify({'message': 'Lesson deleted successfully'})