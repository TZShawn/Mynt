import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ListSubheader
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { subcategories } from '../utils/listCategories';
import { getCategory } from '../utils/getCategory';

interface AddBudgetModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (budget: any) => void;
}

const AddBudgetModal: React.FC<AddBudgetModalProps> = ({ open, onClose, onSave }) => {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');

  // Group categories by their general category
  const groupedCategories = subcategories.reduce((acc: Record<string, typeof subcategories>, item) => {
    const generalCategory = getCategory(item.codeName);
    if (!acc[generalCategory]) {
      acc[generalCategory] = [];
    }
    acc[generalCategory].push(item);
    return acc;
  }, {});

  const handleSave = () => {
    const budget = {
      category,
      budgetedAmount: parseFloat(amount),
    };
    onSave(budget);
    onClose();
    setCategory('');
    setAmount('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Budget</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            label="Category"
          >
            {Object.entries(groupedCategories).map(([group, categories]) => [
              <ListSubheader key={group}>{group}</ListSubheader>,
              ...categories.map(cat => (
                <MenuItem key={cat.codeName} value={cat.codeName}>
                  {cat.displayName}
                </MenuItem>
              ))
            ])}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label="Budget Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSave}
          disabled={!category || !amount}
          variant="contained"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddBudgetModal; 