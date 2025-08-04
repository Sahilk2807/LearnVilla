from flask import Blueprint, jsonify, request
from app.models import Course, Lesson, User
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import db

admin_bp = Blueprint('admin', __name__)

def admin_required():
    def wrapper(fn):
        @jwt_required()
        def decorator(*args, **kwargs):
            current_user = get_jwt_identity()
            if not current_user.get('is_admin'):
                return jsonify(msg="Admins only!"), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

@admin_bp.route('/stats', methods=['GET'])
@admin_required()
def get_stats():
    user_count = User.query.count()
    course_count = Course.query.count()
    return jsonify({'total_users': user_count, 'total_courses': course_count})

# Full CRUD for Courses
@admin_bp.route('/courses', methods=['POST'])
@admin_required()
def create_course():
    data = request.get_json()
    new_course = Course(title=data['title'], description=data['description'], poster_url=data.get('poster_url', ''), category=data['category'])
    db.session.add(new_course)
    db.session.commit()
    return jsonify({'id': new_course.id, 'message': 'Course created'}), 201

# Add other CRUD routes for courses and lessons...