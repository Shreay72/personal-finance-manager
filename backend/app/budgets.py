from flask import Blueprint, request, jsonify
from app import db
from app.models import Budget, Transaction, Category
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from sqlalchemy import func, extract

budgets_bp = Blueprint('budgets', __name__)

@budgets_bp.route('/', methods=['GET'])
@jwt_required()
def get_budgets():
    try:
        current_user_id = int(get_jwt_identity())
        month = datetime.utcnow().month
        year = datetime.utcnow().year
        
        budgets = Budget.query.filter_by(
            user_id=current_user_id,
            month=month,
            year=year
        ).all()
        
        result = []
        for budget in budgets:
            spent = db.session.query(func.sum(Transaction.amount)).filter(
                Transaction.user_id == current_user_id,
                Transaction.category_id == budget.category_id,
                Transaction.type == 'expense',
                extract('month', Transaction.date) == month,
                extract('year', Transaction.date) == year
            ).scalar() or 0.0
            
            category = Category.query.get(budget.category_id)
            
            result.append({
                'budget_id': budget.budget_id,
                'category_id': budget.category_id,
                'category_name': category.name if category else 'Unknown',
                'amount': float(budget.monthly_limit),  # Map monthly_limit to amount
                'period': 'monthly',  # Always monthly for compatibility
                'spent': float(spent)
            })
        
        return jsonify({'budgets': result}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@budgets_bp.route('/', methods=['POST'])
@jwt_required()
def create_budget():
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        category_id = data.get('category_id')
        amount = data.get('amount')  # Frontend sends 'amount'
        
        if not category_id or not amount:
            return jsonify({'error': 'Category and amount are required'}), 400
        
        month = datetime.utcnow().month
        year = datetime.utcnow().year
        
        # Check if budget already exists
        existing = Budget.query.filter_by(
            user_id=current_user_id,
            category_id=int(category_id),
            month=month,
            year=year
        ).first()
        
        if existing:
            return jsonify({'error': 'Budget already exists for this category this month'}), 400
        
        budget = Budget(
            user_id=current_user_id,
            category_id=int(category_id),
            monthly_limit=float(amount),  # Map amount to monthly_limit
            month=month,
            year=year
        )
        
        db.session.add(budget)
        db.session.commit()
        
        return jsonify({
            'message': 'Budget created successfully',
            'budget_id': budget.budget_id
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@budgets_bp.route('/<int:budget_id>', methods=['PUT'])
@jwt_required()
def update_budget(budget_id):
    try:
        current_user_id = int(get_jwt_identity())
        budget = Budget.query.filter_by(
            budget_id=budget_id,
            user_id=current_user_id
        ).first()
        
        if not budget:
            return jsonify({'error': 'Budget not found'}), 404
        
        data = request.get_json()
        
        if data.get('amount'):
            budget.monthly_limit = float(data['amount'])
        if data.get('category_id'):
            budget.category_id = int(data['category_id'])
        
        db.session.commit()
        
        return jsonify({'message': 'Budget updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@budgets_bp.route('/<int:budget_id>', methods=['DELETE'])
@jwt_required()
def delete_budget(budget_id):
    try:
        current_user_id = int(get_jwt_identity())
        budget = Budget.query.filter_by(
            budget_id=budget_id,
            user_id=current_user_id
        ).first()
        
        if not budget:
            return jsonify({'error': 'Budget not found'}), 404
        
        db.session.delete(budget)
        db.session.commit()
        
        return jsonify({'message': 'Budget deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
