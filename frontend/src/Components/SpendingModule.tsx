import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { Transaction } from "../types";
import TransactionRow from "./TrasnactionsRow";
import { fetchAuthSession } from 'aws-amplify/auth';

interface SpendingModuleProps {
  transactions: Transaction[];
}

interface SpendingByCategory {
  name: string;
  value: number;
  percentage: number;
}

const COLORS = [
  "#00B8D9", // Bright Blue
  "#36B37E", // Green
  "#FF5630", // Red
  "#6554C0", // Purple
  "#FFAB00", // Yellow
  "#00C7E6", // Light Blue
  "#2684FF", // Royal Blue
  "#4C9AFF", // Sky Blue
  "#B3D4FF", // Pale Blue
  "#998DD9", // Lavender
];

// Standard Plaid categories
const PLAID_CATEGORIES = [
  'Bank Fees',
  'Cash Advance',
  'Community',
  'Food and Drink',
  'Healthcare',
  'Interest',
  'Payment',
  'Recreation',
  'Service',
  'Shops',
  'Tax',
  'Transfer',
  'Travel',
  'Utilities'
];

const SpendingModule: React.FC<SpendingModuleProps> = ({ transactions }) => {
  const [view, setView] = useState<"Type" | "Merchant">("Type");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      const session = await fetchAuthSession();
      const tk = session.tokens?.idToken?.toString();
      setToken(tk || null);
    };
    getToken();
  }, []);

  const fetchTransactions = async () => {
    try {
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
      if (!data.success) {
        console.error("Failed to fetch transactions");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const processTransactionsData = (
    transactions: Transaction[]
  ): SpendingByCategory[] => 
    {

    let sortBy = (view === "Type") ? "transCategory" : "transMerchant";
    const categoryTotals = transactions.reduce((acc, transaction: Transaction) => {
      const category = transaction[sortBy as keyof Transaction] as string || "Unknown";
      acc[category] = (acc[category] || 0) + (transaction.transAmount > 0 ? transaction.transAmount : 0);
      return acc;
    }, {} as Record<string, number>);

    const totalSpending = Object.values(categoryTotals).reduce(
      (a, b) => a + b,
      0
    );

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value,
        percentage: (value / totalSpending) * 100,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 9)
      .concat(
        transactions.length > 9
          ? {
              name: "Everything else",
              value: Object.entries(categoryTotals)
                .sort((a, b) => b[1] - a[1])
                .slice(9)
                .reduce((acc, [_, value]) => acc + value, 0),
              percentage: 0,
            }
          : []
      )
      .map((item) => ({
        ...item,
        percentage: Number(((item.value / totalSpending) * 100).toFixed(1)),
      }));
  };

  const spendingData = processTransactionsData(transactions).filter((item) => item.value > 0);
  const totalSpending = spendingData.reduce((acc, item) => acc + item.value, 0);

  const getChartOptions = (data: SpendingByCategory[]): EChartsOption => ({
    tooltip: {
      trigger: "item",
      formatter: (params: any) => {
        const { name, value, percent } = params;
        return `${name}: $${value.toFixed(2)} (${percent}%)`;
      },
    },
    legend: {
      show: false,
    },
    series: [
      {
        name: "Spending",
        type: "pie",
        radius: ["50%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: false,
          },
        },
        labelLine: {
          show: false,
        },
        data: data.map((item, index) => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: COLORS[index % COLORS.length],
          },
        })),
      },
    ],
  });

  const groupTransactionsByDate = (transactions: Transaction[]) => {
    return transactions.reduce((groups: { [key: string]: Transaction[] }, transaction) => {
      const date = new Date(transaction.transDate).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {});
  };

  return (
    <div className="space-y-6">
      {/* Spending Overview Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            SPENDING BY MERCHANT
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView("Type")}
              className="text-mynt-gray-400 hover:text-mynt-gray-600"
            >
              By Type
            </button>
            <button
              onClick={() => setView("Merchant")}
              className="text-mynt-gray-400 hover:text-mynt-gray-600"
            >
              By Merchant
            </button>
          </div>
        </div>

        <div className="flex items-start gap-8">
          {/* Donut Chart */}
          <div className="w-1/3 relative">
            <ReactECharts
              option={getChartOptions(spendingData)}
              style={{ height: "300px" }}
              opts={{ renderer: "svg" }}
            />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-2xl font-bold">
                ${totalSpending.toFixed(2)}
              </div>
              <div className="text-sm text-mynt-gray-400">Total</div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            {spendingData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div className="flex-1">
                  <div className="font-medium">{entry.name}</div>
                  <div className="text-sm text-mynt-gray-400">
                    ${entry.value.toFixed(2)} ({entry.percentage}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Transactions</h3>
          <div className="flex items-center gap-4">
            <button className="text-sm px-3 py-1 rounded border border-mynt-gray-300">
              Edit multiple
            </button>
            <button className="text-sm px-3 py-1 rounded border border-mynt-gray-300">
              Sort
            </button>
          </div>
        </div>
        <div className="space-y-6">
          {Object.entries(groupTransactionsByDate(transactions))
            .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
            .map(([date, dateTransactions]) => (
              <div key={date}>
                <h4 className="text-sm w-full bg-gray-200 font-medium text-mynt-gray-600 p-2 mb-2">{date}</h4>
                <div className="space-y-2">
                  {dateTransactions.map((transaction) => (
                    <TransactionRow 
                      key={transaction.transactionId} 
                      transaction={transaction} 
                      onTransactionUpdated={fetchTransactions}
                      token={token}
                    />
                  ))}
                </div>
              </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TransactionItem: React.FC<{transaction: Transaction}> = ({transaction}) => {
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        console.log('Category changed:', {
            transactionId: transaction.transactionId,
            newCategory: e.target.value
        });
    };

    return (
        <div className="grid grid-cols-4 gap-4 py-2 px-8 border-b border-mynt-gray-200 last:border-0 items-center">
            <div className="font-medium">{transaction.transMerchant}</div>
            <div>
                <select 
                    className="w-full border border-mynt-gray-300 rounded px-2 py-1 text-sm"
                    value={transaction.transCategory}
                    onChange={handleCategoryChange}
                >
                    {PLAID_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>
            <div className={`text-sm text-center`}>{transaction.transAccount}</div>
            <div className={`text-sm text-right font-medium ${transaction.transAmount < 0 && 'text-mynt-green'}`}>
                ${transaction.transAmount.toFixed(2)}
            </div>
        </div>
    );
};

export default SpendingModule;
