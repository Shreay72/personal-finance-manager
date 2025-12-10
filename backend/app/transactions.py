from flask import Blueprint, request, jsonify
from app import db
from app.models import Transaction, Category
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/', methods=['GET'])
@jwt_required()
def get_transactions():
    try:
        current_user_id = int(get_jwt_identity())
        
        type_filter = request.args.get('type')
        category_id = request.args.get('category_id')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = Transaction.query.filter_by(user_id=current_user_id)
        
        if type_filter:
            query = query.filter_by(type=type_filter)
        if category_id:
            query = query.filter_by(category_id=category_id)
        if start_date:
            query = query.filter(Transaction.date >= datetime.fromisoformat(start_date))
        if end_date:
            query = query.filter(Transaction.date <= datetime.fromisoformat(end_date))
        
        transactions = query.order_by(Transaction.date.desc()).all()
        
        return jsonify({
            'transactions': [t.to_dict() for t in transactions]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/', methods=['POST'])
@jwt_required()
def add_transaction():
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data or not data.get('type') or not data.get('amount') or not data.get('category_id'):
            return jsonify({'error': 'Type, amount, and category are required'}), 400
        
        if data['type'] not in ['income', 'expense']:
            return jsonify({'error': 'Type must be either income or expense'}), 400
        
        transaction = Transaction(
            user_id=current_user_id,
            type=data['type'],
            amount=float(data['amount']),
            category_id=data['category_id'],
            date=datetime.fromisoformat(data['date']) if data.get('date') else datetime.utcnow(),
            notes=data.get('notes', '')
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'message': 'Transaction added successfully',
            'transaction': transaction.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/<int:transaction_id>', methods=['PUT'])
@jwt_required()
def update_transaction(transaction_id):
    try:
        current_user_id = int(get_jwt_identity())
        transaction = Transaction.query.filter_by(
            transaction_id=transaction_id,
            user_id=current_user_id
        ).first()
        
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
        
        data = request.get_json()
        
        if data.get('type'):
            if data['type'] not in ['income', 'expense']:
                return jsonify({'error': 'Type must be either income or expense'}), 400
            transaction.type = data['type']
        
        if data.get('amount'):
            transaction.amount = float(data['amount'])
        
        if data.get('category_id'):
            transaction.category_id = data['category_id']
        
        if data.get('date'):
            transaction.date = datetime.fromisoformat(data['date'])
        
        if 'notes' in data:
            transaction.notes = data['notes']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Transaction updated successfully',
            'transaction': transaction.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/<int:transaction_id>', methods=['DELETE'])
@jwt_required()
def delete_transaction(transaction_id):
    try:
        current_user_id = int(get_jwt_identity())
        transaction = Transaction.query.filter_by(
            transaction_id=transaction_id,
            user_id=current_user_id
        ).first()
        
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
        
        db.session.delete(transaction)
        db.session.commit()
        
        return jsonify({'message': 'Transaction deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    try:
        current_user_id = int(get_jwt_identity())
        
        categories = Category.query.filter(
            (Category.is_custom == False) | (Category.user_id == current_user_id)
        ).all()
        
        return jsonify({
            'categories': [c.to_dict() for c in categories]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/categories', methods=['POST'])
@jwt_required()
def add_category():
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data or not data.get('name') or not data.get('type'):
            return jsonify({'error': 'Name and type are required'}), 400
        
        if data['type'] not in ['income', 'expense']:
            return jsonify({'error': 'Type must be either income or expense'}), 400
        
        category = Category(
            name=data['name'],
            type=data['type'],
            is_custom=True,
            user_id=current_user_id
        )
        
        db.session.add(category)
        db.session.commit()
        
        return jsonify({
            'message': 'Category created successfully',
            'category': category.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
