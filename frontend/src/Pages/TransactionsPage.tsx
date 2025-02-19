import React, { useEffect, useState } from 'react';
import PlaidLinkButton from '../Components/PlaidLinkButton';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setTransactions, setLoading, setError } from '../store/transactionsSlice';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Transaction } from '../types';
import { subcategories } from '../utils/listCategories';
import { Autocomplete, TextField } from '@mui/material';
import TransactionRow from '../Components/TrasnactionsRow';

const TransactionsPage: React.FC = () => {
  const dispatch = useDispatch();
  const [token, setToken] = useState<string | null>(null);
  const { transactions, isLoading } = useSelector((state: RootState) => state.transactions);

  const fetchTransactions = async () => {
    try {
      dispatch(setLoading(true));
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/transactions`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        dispatch(setTransactions(data.response));
      } else {
        dispatch(setError("Failed to fetch transactions"));
      }
    } catch (error) {
      dispatch(setError("Error fetching transactions"));
    }
  };

  useEffect(() => {
    const getToken = async () => {
      const session = await fetchAuthSession();
      const tk = session.tokens?.idToken?.toString();
      setToken(tk || null);
    };
    getToken();
  }, []);

  useEffect(() => {
    if (token && transactions.length === 0) {
      fetchTransactions();
    }
  }, [token, transactions.length]);


  return (
    <main className="container mx-auto sm:px-4 lg:px-2 w-full py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold">Transactions</h1>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {isLoading ? <p>Loading...</p> : (
            <div className="min-w-full">
              {/* Header */}
              <div className="bg-gray-50 grid grid-cols-3 gap-4 px-6 py-3 border-b border-gray-200">
                <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</div>
                <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</div>
                <div className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</div>
              </div>
              
              {/* Transaction Rows */}
              <div className="divide-y divide-gray-200">
                {transactions.slice().sort((a, b) => new Date(b.transDate).getTime() - new Date(a.transDate).getTime()).map((transaction) => (
                  <TransactionRow 
                    key={transaction.transactionId} 
                    transaction={transaction} 
                    onTransactionUpdated={fetchTransactions}
                    token={token}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default TransactionsPage;

// const TransactionRow: React.FC<{ 
//   transaction: Transaction;
//   onTransactionUpdated: () => Promise<void>;
//   token: string | null;
// }> = ({ transaction, onTransactionUpdated, token }) => {
//   const handleUpdateCategory = async (newCategory: string | null) => {
//     if (!newCategory) return;
    
//     try {
//       const response = await fetch(`${process.env.REACT_APP_BASE_URL}/transactions/update-category`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           transaction: transaction,
//           category: newCategory,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to update category');
//       }
      
//       // Fetch updated transactions after successful category update
//       await onTransactionUpdated();
//     } catch (error) {
//       console.error("Error updating category:", error);
//     }
//   }

//   console.log(transaction.transCategory);

//   return (
//     <div 
//       key={transaction.transactionId} 
//       className="grid grid-cols-4 gap-4 px-6 py-4 hover:bg-gray-50"
//     >
//       <div className="text-sm text-gray-500 whitespace-nowrap">
//         {new Date(transaction.transDate).toLocaleDateString()}
//       </div>

//       <div className="text-sm text-gray-500">
//         {transaction.transMerchant}
//       </div>

//       <div className="text-sm text-gray-500">
//         <Autocomplete
//           size="small"
//           options={subcategories}
//           getOptionLabel={(option) => option.displayName || 'Unknown'}
//           value={subcategories.find(cat => cat.codeName == (transaction.transCategory)) || {codeName: transaction.transCategory, displayName: transaction.transCategory}}
//           onChange={(_, newValue) => handleUpdateCategory(newValue?.codeName || null)}
//           renderInput={(params) => (
//             <TextField
//               {...params}
//               variant="standard"
//               sx={{
//                 '& .MuiInput-underline:before': { borderBottom: 'none' },
//                 '& .MuiInput-underline:hover:before': { borderBottom: '1px solid rgba(0, 0, 0, 0.42)' },
//                 '& .MuiInput-underline:after': { borderBottom: '2px solid #4F46E5' }
//               }}
//             />
//           )}
//           sx={{
//             '& .MuiAutocomplete-input': {
//               padding: '0px !important',
//             },
//             '& .MuiAutocomplete-endAdornment': {
//               opacity: 0,
//               transition: 'opacity 0.2s ease',
//             },
//             '&:hover .MuiAutocomplete-endAdornment': {
//               opacity: 1,
//             }
//           }}
//         />
//       </div>

//       <div className={`text-sm text-gray-500 whitespace-nowrap text-right ${transaction.transAmount < 0 && 'text-green-500'}`}>
//         {transaction.transAmount < 0 ? `+$${Math.abs(Number(transaction.transAmount.toFixed(2)))}` : `$${transaction.transAmount.toFixed(2)}`}
//       </div>
//     </div>
//   )
// }


