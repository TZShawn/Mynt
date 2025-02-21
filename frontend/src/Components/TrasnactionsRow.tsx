import { Autocomplete, TextField } from "@mui/material";
import { Transaction } from "../types";
import { getCategory } from "../utils/getCategory";
import { subcategories } from "../utils/listCategories";
import { useEffect, useState } from "react";

const TransactionRow: React.FC<{ 
    transaction: Transaction;
    onTransactionUpdated: () => Promise<void>;
    token: string | null;
  }> = ({ transaction, onTransactionUpdated, token }) => {
    const handleUpdateCategory = async (newCategory: string | null) => {
      if (!newCategory) return;
      
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/transactions/update-category`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            transaction: transaction,
            category: newCategory,
          }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to update category');
        }
        
        // Fetch updated transactions after successful category update
        await onTransactionUpdated();
      } catch (error) {
        console.error("Error updating category:", error);
      }
    }
  
  
    return (
      <div 
        key={transaction.transactionId} 
        className="grid grid-cols-4 gap-4 px-6 py-4 hover:bg-gray-50"
      >
        <div className="text-sm text-gray-500 whitespace-nowrap">
          {new Date(transaction.transDate).toLocaleDateString()}
        </div>
  
        <div className="text-sm text-gray-500">
          {transaction.transMerchant}
        </div>
  
        <div className="text-sm text-gray-500">
          <Autocomplete
            size="small"
            options={subcategories}
            getOptionLabel={(option) => option.displayName || 'Unknown'}
            value={subcategories.find(cat => cat.codeName == (transaction.transCategory)) || {codeName: transaction.transCategory, displayName: transaction.transCategory}}
            onChange={(_, newValue) => handleUpdateCategory(newValue?.codeName || null)}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard"
                sx={{
                  '& .MuiInput-underline:before': { borderBottom: 'none' },
                  '& .MuiInput-underline:hover:before': { borderBottom: '1px solid rgba(0, 0, 0, 0.42)' },
                  '& .MuiInput-underline:after': { borderBottom: '2px solid #4F46E5' }
                }}
              />
            )}
            sx={{
              '& .MuiAutocomplete-input': {
                padding: '0px !important',
              },
              '& .MuiAutocomplete-endAdornment': {
                opacity: 0,
                transition: 'opacity 0.2s ease',
              },
              '&:hover .MuiAutocomplete-endAdornment': {
                opacity: 1,
              }
            }}
          />
        </div>
  
        <div className={`text-sm text-gray-500 whitespace-nowrap text-right ${transaction.transAmount < 0 && 'text-green-500'}`}>
          {transaction.transAmount < 0 ? `+$${Math.abs(Number(transaction.transAmount.toFixed(2)))}` : `$${transaction.transAmount.toFixed(2)}`}
        </div>
      </div>
    )
  }

export default TransactionRow;