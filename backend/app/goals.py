from flask import Blueprint, request, jsonify
from app import db
from app.models import SavingsGoal
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

goals_bp = Blueprint('goals', __name__)

@goals_bp.route('/', methods=['GET'])
@jwt_required()
def get_goals():
    try:
        current_user_id = int(get_jwt_identity())
        goals = SavingsGoal.query.filter_by(user_id=current_user_id).all()
        
        return jsonify({
            'goals': [{
                'goal_id': g.goal_id,
                'name': g.title,  # Map title to name for frontend
                'target_amount': float(g.target_amount),
                'current_amount': float(g.saved_amount),  # Map saved_amount to current_amount
                'deadline': g.deadline.strftime('%Y-%m-%d') if g.deadline else None
            } for g in goals]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@goals_bp.route('/', methods=['POST'])
@jwt_required()
def create_goal():
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        # Frontend sends 'name', backend expects 'title'
        name = data.get('name')
        target_amount = data.get('target_amount')
        deadline = data.get('deadline')
        
        if not name or not target_amount:
            return jsonify({'error': 'Name and target amount are required'}), 400
        
        # Parse deadline
        deadline_obj = None
        if deadline:
            try:
                deadline_obj = datetime.strptime(deadline, '%Y-%m-%d')
            except:
                try:
                    deadline_obj = datetime.fromisoformat(deadline)
                except:
                    return jsonify({'error': 'Invalid deadline format'}), 400
        
        goal = SavingsGoal(
            user_id=current_user_id,
            title=name,  # Map name to title
            target_amount=float(target_amount),
            saved_amount=0.0,
            deadline=deadline_obj
        )
        
        db.session.add(goal)
        db.session.commit()
        
        return jsonify({
            'message': 'Goal created successfully',
            'goal': {
                'goal_id': goal.goal_id,
                'name': goal.title,
                'target_amount': float(goal.target_amount),
                'current_amount': float(goal.saved_amount),
                'deadline': goal.deadline.strftime('%Y-%m-%d') if goal.deadline else None
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@goals_bp.route('/<int:goal_id>', methods=['PUT'])
@jwt_required()
def update_goal(goal_id):
    try:
        current_user_id = int(get_jwt_identity())
        goal = SavingsGoal.query.filter_by(
            goal_id=goal_id,
            user_id=current_user_id
        ).first()
        
        if not goal:
            return jsonify({'error': 'Goal not found'}), 404
        
        data = request.get_json()
        
        if data.get('name'):
            goal.title = data['name']
        if data.get('target_amount'):
            goal.target_amount = float(data['target_amount'])
        if 'deadline' in data and data['deadline']:
            try:
                goal.deadline = datetime.strptime(data['deadline'], '%Y-%m-%d')
            except:
                goal.deadline = datetime.fromisoformat(data['deadline'])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Goal updated successfully',
            'goal': {
                'goal_id': goal.goal_id,
                'name': goal.title,
                'target_amount': float(goal.target_amount),
                'current_amount': float(goal.saved_amount),
                'deadline': goal.deadline.strftime('%Y-%m-%d') if goal.deadline else None
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@goals_bp.route('/<int:goal_id>', methods=['DELETE'])
@jwt_required()
def delete_goal(goal_id):
    try:
        current_user_id = int(get_jwt_identity())
        goal = SavingsGoal.query.filter_by(
            goal_id=goal_id,
            user_id=current_user_id
        ).first()
        
        if not goal:
            return jsonify({'error': 'Goal not found'}), 404
        
        db.session.delete(goal)
        db.session.commit()
        
        return jsonify({'message': 'Goal deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@goals_bp.route('/<int:goal_id>/contribute', methods=['POST'])
@jwt_required()
def contribute_to_goal(goal_id):
    try:
        current_user_id = int(get_jwt_identity())
        goal = SavingsGoal.query.filter_by(
            goal_id=goal_id,
            user_id=current_user_id
        ).first()
        
        if not goal:
            return jsonify({'error': 'Goal not found'}), 404
        
        data = request.get_json()
        amount = float(data.get('amount', 0))
        
        if amount <= 0:
            return jsonify({'error': 'Amount must be positive'}), 400
        
        goal.saved_amount = float(goal.saved_amount) + amount
        db.session.commit()
        
        return jsonify({
            'message': 'Contribution added successfully',
            'goal': {
                'goal_id': goal.goal_id,
                'name': goal.title,
                'target_amount': float(goal.target_amount),
                'current_amount': float(goal.saved_amount),
                'deadline': goal.deadline.strftime('%Y-%m-%d') if goal.deadline else None
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
