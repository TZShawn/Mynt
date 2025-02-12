import React, { useState, useEffect } from "react";
import { RootState } from "../store/store";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { FaSync } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import SpendingModule from "../Components/SpendingModule";
import CashFlowModule from "../Components/CashFlowModule";
import { Transaction } from "../types";

interface QueryRange {
  start: string;
  end: string;
}

const TrendsPage: React.FC = () => {
  const dispatch = useDispatch();
  const [token, setToken] = useState<string | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("this-month");
  const [tempCustomRange, setTempCustomRange] = useState<QueryRange>({ start: '', end: '' });
  const [queryRange, setQueryRange] = useState<QueryRange>(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
      start: firstDayOfMonth.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0],
    };
  });
  const location = useLocation();
  const navigate = useNavigate();

  const { transactions, isLoading } = useSelector(
    (state: RootState) => state.transactions
  ) as { transactions: Transaction[]; isLoading: boolean };

  const currentView = location.pathname.includes("cash-flow") ? "cash-flow" : "spendings";

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.transDate);
    const startDate = new Date(queryRange.start);
    const endDate = new Date(queryRange.end);
    return transactionDate >= startDate && transactionDate <= endDate;
  });

  const calculateTimeRange = (rangeType: string): QueryRange => {
    const today = new Date();
    const end = today.toISOString().split('T')[0];
    let start: string;

    switch (rangeType) {
      case "this-month": {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        start = firstDay.toISOString().split('T')[0];
        break;
      }
      case "last-3-months": {
        const firstDay = new Date(today.getFullYear(), today.getMonth() - 2, 1);
        start = firstDay.toISOString().split('T')[0];
        break;
      }
      case "last-6-months": {
        const firstDay = new Date(today.getFullYear(), today.getMonth() - 5, 1);
        start = firstDay.toISOString().split('T')[0];
        break;
      }
      case "last-year": {
        const firstDay = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        start = firstDay.toISOString().split('T')[0];
        break;
      }
      default:
        start = queryRange.start;
    }

    return { start, end };
  };

  const handleTimeRangeChange = (rangeType: string) => {
    setSelectedTimeRange(rangeType);
    const newRange = calculateTimeRange(rangeType);
    setQueryRange(newRange);
    setShowFilterDropdown(false);
  };

  const handleCustomDateChange = (field: 'start' | 'end', value: string) => {
    setTempCustomRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyCustomRange = () => {
    setSelectedTimeRange('custom');
    setQueryRange(tempCustomRange);
    setShowFilterDropdown(false);
  };

  const isCustomRangeValid = tempCustomRange.start && tempCustomRange.end;

  const timeRangeOptions = [
    { label: "This Month", value: "this-month" },
    { label: "Last 3 Months", value: "last-3-months" },
    { label: "Last 6 Months", value: "last-6-months" },
    { label: "Last Year", value: "last-year" },
  ];

  // Update query range when component mounts
  useEffect(() => {
    const initialRange = calculateTimeRange(selectedTimeRange);
    setQueryRange(initialRange);
    setTempCustomRange(initialRange); // Initialize temp range with current range
  }, []);

  // Reset temp custom range when opening dropdown
  useEffect(() => {
    if (showFilterDropdown) {
      setTempCustomRange(queryRange);
    }
  }, [showFilterDropdown]);

  return (
    <div className="max-h-screen bg-mynt-gray-200">
      {/* Header Banner */}
      <div className="w-full bg-mynt-gray-500 py-2 px-8 mb-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-semi-bold text-white">Trends</h1>
            <div className="flex gap-6">
              <button 
                onClick={() => navigate("/trends/cash-flow")}
                className={`text-xl ${
                  currentView === "cash-flow"
                    ? "text-mynt-green border-b-2 border-mynt-green"
                    : "text-mynt-gray-200 hover:text-mynt-green"
                } transition-colors`}
              >
                Cash Flow
              </button>
              <button 
                onClick={() => navigate("/trends/spendings")}
                className={`text-xl ${
                  currentView === "spendings"
                    ? "text-mynt-green border-b-2 border-mynt-green"
                    : "text-mynt-gray-200 hover:text-mynt-green"
                } transition-colors`}
              >
                Spendings
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {}}
              className="p-1 text-white hover:text-mynt-gray-200 transition-colors"
              title="Refresh Data"
            >
              <FaSync className={isLoading ? "animate-spin" : ""} size={16} />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`p-1 text-white hover:text-mynt-gray-200 transition-colors
                border text-xl border-mynt-gray-200 rounded-md px-2 ${
                  showFilterDropdown ? "bg-mynt-gray-400" : ""
                }`}
              >
                Filters
              </button>
              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg p-4 z-50">
                  <h3 className="text-mynt-gray-500 font-semibold mb-3">Time Range</h3>
                  <div className="space-y-4">
                    {/* Preset Options */}
                    <div className="space-y-2">
                      {timeRangeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleTimeRangeChange(option.value)}
                          className={`w-full text-left px-3 py-2 rounded-md ${
                            selectedTimeRange === option.value
                              ? "bg-mynt-green text-white"
                              : "hover:bg-mynt-gray-200"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    
                    {/* Custom Date Range */}
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-mynt-gray-500 mb-2">Custom Range</h4>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-sm text-mynt-gray-400 mb-1">From</label>
                          <input
                            type="date"
                            value={tempCustomRange.start}
                            onChange={(e) => handleCustomDateChange('start', e.target.value)}
                            max={tempCustomRange.end || undefined}
                            className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-mynt-green"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-mynt-gray-400 mb-1">To</label>
                          <input
                            type="date"
                            value={tempCustomRange.end}
                            onChange={(e) => handleCustomDateChange('end', e.target.value)}
                            min={tempCustomRange.start || undefined}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-mynt-green"
                          />
                        </div>
                        <button
                          onClick={handleApplyCustomRange}
                          disabled={!isCustomRangeValid}
                          title={!isCustomRangeValid ? "Please select both start and end dates" : "Apply custom range"}
                          className={`w-full mt-2 px-4 py-2 rounded-md text-white transition-colors ${
                            isCustomRangeValid
                              ? "bg-mynt-green hover:bg-mynt-green-dark"
                              : "bg-mynt-green/50 cursor-not-allowed"
                          }`}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-mynt-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mynt-green mx-auto"></div>
            <p className="mt-4 text-mynt-gray-400">Fetching your accounts...</p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 pb-8">
        {currentView === "spendings" ? (
          <SpendingModule transactions={filteredTransactions} />
        ) : (
          <CashFlowModule />
        )}
      </div>
    </div>
  );
};

export default TrendsPage;
