from flask import Blueprint, jsonify, request, abort
from app.models import Course, Lesson, Enrollment, Watchlist, User
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import db
from .utils import send_contact_email

# Main blueprint for public and standard user routes
main_bp = Blueprint('main', __name__)

# -------------------------------------
# --- Publicly Accessible Routes ---
# -------------------------------------

@main_bp.route('/courses', methods=['GET'])
def get_courses():
    """Returns a list of all courses, with optional search."""
    query = request.args.get('q', '')
    category = request.args.get('category', '')
    
    course_query = Course.query
    if query:
        course_query = course_query.filter(Course.title.ilike(f'%{query}%'))
    if category:
        course_query = course_query.filter_by(category=category)

    courses = course_query.order_by(Course.id.desc()).all()
    return jsonify([{
        'id': c.id, 'title': c.title, 'description': c.description, 
        'poster_url': c.poster_url, 'category': c.category
    } for c in courses])

@main_bp.route('/courses/featured', methods=['GET'])
def get_featured_courses():
    """Returns a short list of featured courses for the home page."""
    courses = Course.query.filter_by(featured=True).limit(4).all()
    return jsonify([{
        'id': c.id, 'title': c.title, 'poster_url': c.poster_url, 'category': c.category
    } for c in courses])

@main_bp.route('/courses/<int:course_id>', methods=['GET'])
@jwt_required(optional=True)
def get_course_detail(course_id):
    """Returns detailed information for a single course, including lessons."""
    course = Course.query.get_or_404(course_id)
    current_user = get_jwt_identity()
    user_id = current_user['id'] if current_user else None
    
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
        # Secure the content URL. In a real app, generate a temporary signed URL.
        if is_enrolled or not lesson.is_premium:
            lesson_info['content_url'] = lesson.content_url
        else:
            lesson_info['content_url'] = None # Content is locked
        lessons_data.append(lesson_info)

    return jsonify({
        'id': course.id, 'title': course.title, 'description': course.description,
        'poster_url': course.poster_url, 'category': course.category, 
        'is_enrolled': is_enrolled, 'lessons': lessons_data
    })

@main_bp.route('/contact', methods=['POST'])
def contact_form():
    """Handles the submission of the contact form and sends an email."""
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
        # In a real app, you would log this error.
        return jsonify({'error': 'Failed to send message.'}), 500

# -------------------------------------
# --- Protected User Routes ---
# -------------------------------------

@main_bp.route('/user/dashboard', methods=['GET'])
@jwt_required()
def user_dashboard():
    """Returns a list of courses the current user is enrolled in."""
    current_user_identity = get_jwt_identity()
    user_id = current_user_identity['id']
    
    enrollments = Enrollment.query.filter_by(user_id=user_id).all()
    enrolled_course_ids = [e.course_id for e in enrollments]
    
    courses = Course.query.filter(Course.id.in_(enrolled_course_ids)).all()
    
    return jsonify([{
        'id': c.id, 'title': c.title, 'poster_url': c.poster_url, 'category': c.category
    } for c in courses])

@main_bp.route('/courses/<int:course_id>/enroll', methods=['POST'])
@jwt_required()
def enroll_in_course(course_id):
    """Enrolls the current user in a course."""
    user_id = get_jwt_identity()['id']
    
    # Check if the course exists
    course = Course.query.get_or_404(course_id)
    
    # Check if already enrolled
    if Enrollment.query.filter_by(user_id=user_id, course_id=course_id).first():
        return jsonify({'message': 'Already enrolled in this course'}), 409
        
    # This is where a payment check would go in a real application
    
    new_enrollment = Enrollment(user_id=user_id, course_id=course_id)
    db.session.add(new_enrollment)
    db.session.commit()
    
    return jsonify({'message': f'Successfully enrolled in {course.title}!'}), 201

# Add other user-specific routes like watchlist, profile settings, etc. here