from flask import Blueprint, jsonify, request, abort
from app.models import Course, Lesson, Enrollment, Watchlist, User
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import db
from .utils import send_contact_email

main_bp = Blueprint('main', __name__)

# Public routes
@main_bp.route('/courses', methods=['GET'])
def get_courses():
    query = request.args.get('q', '')
    category = request.args.get('category', '')
    
    course_query = Course.query
    if query:
        course_query = course_query.filter(Course.title.ilike(f'%{query}%'))
    if category:
        course_query = course_query.filter_by(category=category)

    courses = course_query.all()
    return jsonify([{
        'id': c.id, 'title': c.title, 'description': c.description, 
        'poster_url': c.poster_url, 'category': c.category
    } for c in courses])

@main_bp.route('/courses/featured', methods=['GET'])
def get_featured_courses():
    courses = Course.query.filter_by(featured=True).limit(4).all()
    return jsonify([{
        'id': c.id, 'title': c.title, 'poster_url': c.poster_url, 'category': c.category
    } for c in courses])

@main_bp.route('/courses/<int:course_id>', methods=['GET'])
@jwt_required(optional=True)
def get_course_detail(course_id):
    course = Course.query.get_or_404(course_id)
    user_id = get_jwt_identity()['id'] if get_jwt_identity() else None
    
    is_enrolled = False
    if user_id:
        is_enrolled = Enrollment.query.filter_by(user_id=user_id, course_id=course_id).first() is not None

    lessons_data = []
    for lesson in course.lessons:
        lesson_info = {
            'id': lesson.id,
            'title': lesson.title,
            'content_type': lesson.content_type.value,
            'is_premium': lesson.is_premium
        }
        # Secure the content URL
        if is_enrolled or not lesson.is_premium:
            lesson_info['content_url'] = lesson.content_url # In a real app, generate a temporary signed URL
        else:
            lesson_info['content_url'] = None # Locked
        lessons_data.append(lesson_info)

    return jsonify({
        'id': course.id, 'title': course.title, 'description': course.description,
        'poster_url': course.poster_url, 'category': course.category, 
        'is_enrolled': is_enrolled, 'lessons': lessons_data
    })

@main_bp.route('/contact', methods=['POST'])
def contact_form():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')
    
    if not all([name, email, message]):
        return jsonify({'error': 'All fields are required.'}), 400

    try:
        send_contact_email(name, email, message)
        return jsonify({'message': 'Message sent successfully!'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# You can add more user-specific routes here (watchlist, enroll, etc.)