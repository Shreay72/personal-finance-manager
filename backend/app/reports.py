from flask import Blueprint, request, jsonify
from app import db
from app.models import Transaction, Budget, SavingsGoal
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from sqlalchemy import func, extract

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    try:
        current_user_id = int(get_jwt_identity())
        month = request.args.get('month', datetime.utcnow().month, type=int)
        year = request.args.get('year', datetime.utcnow().year, type=int)
        
        total_income = db.session.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == current_user_id,
            Transaction.type == 'income',
            extract('month', Transaction.date) == month,
            extract('year', Transaction.date) == year
        ).scalar() or 0.0
        
        total_expenses = db.session.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == current_user_id,
            Transaction.type == 'expense',
            extract('month', Transaction.date) == month,
            extract('year', Transaction.date) == year
        ).scalar() or 0.0
        
        category_spending = db.session.query(
            Transaction.category_id,
            func.sum(Transaction.amount).label('total')
        ).join(Transaction.category).filter(
            Transaction.user_id == current_user_id,
            Transaction.type == 'expense',
            extract('month', Transaction.date) == month,
            extract('year', Transaction.date) == year
        ).group_by(Transaction.category_id).all()
        
        categories = []
        for cat_id, total in category_spending:
            from app.models import Category
            cat = Category.query.get(cat_id)
            if cat:
                categories.append({
                    'category': cat.name,
                    'amount': total
                })
        
        savings = total_income - total_expenses
        
        goals = SavingsGoal.query.filter_by(user_id=current_user_id).all()
        goals_summary = [g.to_dict() for g in goals]
        
        return jsonify({
            'total_income': total_income,
            'total_expenses': total_expenses,
            'savings': savings,
            'category_spending': categories,
            'goals': goals_summary,
            'month': month,
            'year': year
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/monthly-trend', methods=['GET'])
@jwt_required()
def get_monthly_trend():
    try:
        current_user_id = int(get_jwt_identity())
        year = request.args.get('year', datetime.utcnow().year, type=int)
        
        monthly_data = []
        for month in range(1, 13):
            income = db.session.query(func.sum(Transaction.amount)).filter(
                Transaction.user_id == current_user_id,
                Transaction.type == 'income',
                extract('month', Transaction.date) == month,
                extract('year', Transaction.date) == year
            ).scalar() or 0.0
            
            expenses = db.session.query(func.sum(Transaction.amount)).filter(
                Transaction.user_id == current_user_id,
                Transaction.type == 'expense',
                extract('month', Transaction.date) == month,
                extract('year', Transaction.date) == year
            ).scalar() or 0.0
            
            monthly_data.append({
                'month': month,
                'income': income,
                'expenses': expenses,
                'savings': income - expenses
            })
        
        return jsonify({'monthly_trend': monthly_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
