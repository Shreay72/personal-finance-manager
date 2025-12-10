from app import create_app, db
from app.models import Category

def seed_categories():
    app = create_app()
    
    with app.app_context():
        # Check if categories already exist
        existing = Category.query.first()
        if existing:
            print("Categories already exist in database!")
            return
        
        # Default expense categories
        expense_categories = [
            'Food & Dining',
            'Shopping',
            'Transportation',
            'Entertainment',
            'Bills & Utilities',
            'Healthcare',
            'Education',
            'Personal Care',
            'Travel',
            'Housing',
            'Insurance',
            'Groceries',
            'Fitness',
            'Clothing',
            'Gifts & Donations',
            'Other Expenses'
        ]
        
        # Default income categories
        income_categories = [
            'Salary',
            'Freelance',
            'Business',
            'Investments',
            'Rental Income',
            'Gifts',
            'Other Income'
        ]
        
        # Add expense categories
        for name in expense_categories:
            category = Category(
                name=name,
                type='expense',
                is_custom=False,
                user_id=None
            )
            db.session.add(category)
        
        # Add income categories
        for name in income_categories:
            category = Category(
                name=name,
                type='income',
                is_custom=False,
                user_id=None
            )
            db.session.add(category)
        
        db.session.commit()
        print(f"✅ Added {len(expense_categories)} expense categories")
        print(f"✅ Added {len(income_categories)} income categories")
        print("✅ Database seeded successfully!")

if __name__ == '__main__':
    seed_categories()
