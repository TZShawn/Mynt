const transactionCategories: Record<string, string> = {
    // Income
    "INCOME": "Income",
    "TRANSFER_IN": "Income",
    "INTEREST": "Income",
  
    // Expenses
    "Charity": "Gifts & Donations",
    "Gifts": "Gifts & Donations",
    "Auto Payment": "Auto & Transport",
    "Public Transit": "Auto & Transport",
    "Gas": "Auto & Transport",
    "Auto Maintenance": "Auto & Transport",
    "Parking & Tolls": "Auto & Transport",
    "Taxi & Ride Shares": "Auto & Transport",
    "Mortgage": "Housing",
    "Rent": "Housing",
    "Home Improvement": "Housing",
    "Garbage": "Bills & Utilities",
    "Water": "Bills & Utilities",
    "Gas & Electric": "Bills & Utilities",
    "Internet & Cable": "Bills & Utilities",
    "Phone": "Bills & Utilities",
    "Groceries": "Food & Dining",
    "Restaurants & Bars": "Food & Dining",
    "Coffee Shops": "Food & Dining",
    "Travel & Vacation": "Travel & Lifestyle",
    "Entertainment & Recreation": "Travel & Lifestyle",
    "Personal": "Travel & Lifestyle",
    "Pets": "Travel & Lifestyle",
    "Fun Money": "Travel & Lifestyle",
    "Shopping": "Shopping",
    "Clothing": "Shopping",
    "Furniture & Housewares": "Shopping",
    "Electronics": "Shopping",
    "Child Care": "Children",
    "Child Activities": "Children",
    "Student Loans": "Education",
    "Education": "Education",
    "Medical": "Health & Wellness",
    "Dentist": "Health & Wellness",
    "Fitness": "Health & Wellness",
    "Loan Repayment": "Financial",
    "Financial & Legal Services": "Financial",
    "Financial Fees": "Financial",
    "Cash & ATM": "Financial",
    "Insurance": "Financial",
    "Taxes": "Financial",
    "Uncategorized": "Other",
    "Check": "Other",
    "Miscellaneous": "Other",
  
    // Business
    "Advertising & Promotion": "Business",
    "Business Utilities & Communication": "Business",
    "Employee Wages & Contract Labor": "Business",
    "Business Travel & Meals": "Business",
    "Business Auto Expenses": "Business",
    "Business Insurance": "Business",
    "Office Supplies & Expenses": "Business",
    "Office Rent": "Business",
    "Postage & Shipping": "Business",
  
    // Transfers
    "PAYMENT": "Transfers",
    "TRANSFER_OUT": "Transfers",

    // General:
    'Food & Dining': 'Food & Dining',
    'Travel & Lifestyle': 'Travel & Lifestyle',
    'Children': 'Children',
    'Health & Wellness': 'Health & Wellness',
    'Financial': 'Financial',
    'Bills & Utilities': 'Bills & Utilities',
    'Gifts & Donations': 'Gifts & Donations',
    'Other': 'Other',
    'Transfers': 'Transfers',
    'Business': 'Business',
    'Income': 'Income',

    // Financial
    "BANK_FEES": "Financial",
    "OVERDRAFT_FEES": "Financial",
    "ATM_FEES": "Financial",
    "INSURANCE": "Financial",
    "TAX": "Financial",

    // Entertainment & Recreation
    "ENTERTAINMENT": "Travel & Lifestyle",
    "RECREATION": "Travel & Lifestyle",
    "ARTS": "Travel & Lifestyle",
    "MOVIES": "Travel & Lifestyle",
    "MUSIC": "Travel & Lifestyle",

    // Food and Dining
    "FOOD_AND_DRINK": "Food & Dining",
    "RESTAURANTS": "Food & Dining",
    "COFFEE": "Food & Dining",
    "GROCERIES": "Food & Dining",

    // Shopping
    "GENERAL_MERCHANDISE": "Shopping",
    "CLOTHING": "Shopping",
    "ELECTRONICS": "Shopping",
    "FURNITURE": "Shopping",
    "HARDWARE": "Shopping",
    "HOME_IMPROVEMENT": "Shopping",

    // Health & Wellness
    "HEALTHCARE": "Health & Wellness",
    "PHARMACY": "Health & Wellness",
    "PERSONAL_CARE": "Health & Wellness",

    // Services
    "GENERAL_SERVICES": "Professional Services",
    "PROFESSIONAL_SERVICES": "Professional Services",

    // Charitable
    "GOVERNMENT_AND_NON_PROFIT": "Gifts & Donations",
    "CHARITABLE": "Gifts & Donations",

    // Auto & Transport
    "TRANSPORTATION": "Auto & Transport",
    "PUBLIC_TRANSIT": "Auto & Transport",
    "TAXI": "Auto & Transport",
    "PARKING": "Auto & Transport",
    "GAS": "Auto & Transport",

    // Travel
    "TRAVEL": "Travel & Lifestyle",
    "AIRLINES": "Travel & Lifestyle",
    "HOTELS": "Travel & Lifestyle",
    "RENTAL_CAR": "Travel & Lifestyle",

    // Housing & Utilities
    "RENT_AND_UTILITIES": "Bills & Utilities",
    "UTILITIES": "Bills & Utilities",
    "TELECOMMUNICATION": "Bills & Utilities",
    

    "LOAN PAYMENTS": "Financial",

    // Other
    "OTHER": "Other",
    "UNCATEGORIZED": "Other",
  };
  
export const getCategory = (transactionCategory: string) => {
    return transactionCategories[transactionCategory] || "Other";
};
