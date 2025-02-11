import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import {
  setTransactions,
  setLoading,
  setError,
} from "../store/transactionsSlice";
import { fetchAuthSession } from "aws-amplify/auth";
import { FaSync } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ReactECharts from "echarts-for-react";

interface TransactionItem {
  transactionId: string;
  transDate: string;
  transAmount: number;
  transMerchant: string;
}

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { transactions, isLoading } = useSelector(
    (state: RootState) => state.transactions
  );
  const [token, setToken] = useState<string | null>(null);

  //////////////////// MONTHLY SPENDING ////////////////////
  const getMonthlySpending = () => {
    const currentDate = new Date().toISOString().split("T")[0].split("-");
    console.log(currentDate);
    const currentMonth = parseInt(currentDate[1]);
    const lastMonth = currentMonth - 1 === 0 ? 12 : currentMonth - 1;
    const searchYear =
      currentMonth - 1 === 0
        ? parseInt(currentDate[0]) - 1
        : parseInt(currentDate[0]);

    let lastMonthSpending = 0;
    let thisMonthSpending = 0;

    let lastMonthSeries = [];
    let thisMonthSeries = [];

    const prevMonthTrans = transactions
      .filter(
        (transaction) =>
          parseInt(transaction.transDate.split("-")[1]) === lastMonth &&
          parseInt(transaction.transDate.split("-")[0]) === searchYear
      )
      .filter((transaction) => transaction.transAmount > 0);
    const thisMonthTrans = transactions
      .filter(
        (transaction) =>
          parseInt(transaction.transDate.split("-")[1]) === currentMonth &&
          parseInt(transaction.transDate.split("-")[0]) === searchYear
      )
      .filter((transaction) => transaction.transAmount > 0);

    console.log(prevMonthTrans);
    console.log(thisMonthTrans);

    for (let i = 1; i <= 31; i++) {
      const lastMonthTransaction = prevMonthTrans
        .filter(
          (transaction) =>
            parseInt(transaction.transDate.split("-")[1]) === lastMonth &&
            parseInt(transaction.transDate.split("-")[2]) === i &&
            parseInt(transaction.transDate.split("-")[0]) === searchYear
        )
        .filter((transaction) => transaction.transAmount > 0);

      const thisMonthTransaction = thisMonthTrans
        .filter(
          (transaction) =>
            parseInt(transaction.transDate.split("-")[1]) === currentMonth &&
            parseInt(transaction.transDate.split("-")[2]) === i &&
            parseInt(transaction.transDate.split("-")[0]) === searchYear
        )
        .filter((transaction) => transaction.transAmount > 0);

      if (lastMonthTransaction.length > 0) {
        lastMonthSpending += lastMonthTransaction.reduce(
          (acc, transaction) => acc + transaction.transAmount,
          0
        );
        lastMonthSeries.push(Math.floor(lastMonthSpending * 100) / 100);
      } else {
        lastMonthSeries.push(Math.floor(lastMonthSpending * 100) / 100);
      }

      if (thisMonthTransaction.length > 0) {
        thisMonthSpending += thisMonthTransaction.reduce(
          (acc, transaction) => acc + transaction.transAmount,
          0
        );
        thisMonthSeries.push(Math.floor(thisMonthSpending * 100) / 100);
      } else if (i <= parseInt(currentDate[2])) {
        thisMonthSeries.push(Math.floor(thisMonthSpending * 100) / 100);
      } else {
        thisMonthSeries.push(null);
      }
    }

    const option = {
      text: {
        text: "Monthly Spending",
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: Array.from({ length: 31 }, (_, i) => i + 1),
        axisLabel: {
          interval: 1,
          formatter: (value: number) => (value % 2 === 1 ? `Day ${value}` : ""),
        },
      },
      yAxis: {
        type: "value",
      },

      series: [
        {
          name: "Last Month",
          type: "line",
          data: lastMonthSeries,
          color: "#d4d4d4",
          showSymbol: false,
          emphasis: {
            focus: "series",
          },
        },
        {
          name: "This Month",
          type: "line",
          data: thisMonthSeries,
          areaStyle: {},
          color: "#2a9d74",
          showSymbol: false,
          emphasis: {
            focus: "series",
          },
        },
      ],
    };

    return option;
  };

  const monthlySpendingOptions = useMemo(
    () => getMonthlySpending(),
    [transactions]
  );

  //////////////////// NET WORTH ////////////////////
  const getNetWorth = () => {
    const currentDate = new Date().toISOString().split("T")[0].split("-")[1];
  };

  const netWorth = useMemo(() => getNetWorth(), [transactions]);

  //////////////////// BUDGET OVERVIEW ////////////////////
  const getBudgetOverview = () => {
    const currentDate = new Date().toISOString().split("T")[0].split("-")[1];
  };

  const budgetOverview = useMemo(() => getBudgetOverview(), [transactions]);

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
    <div className="max-h-screen bg-mynt-gray-200">
      {/* Header Banner */}
      <div className="w-full bg-mynt-gray-500 py-3 px-8 mb-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-semi-bold text-white">Dashboard</h1>
          <button
            onClick={fetchTransactions}
            className="p-1 text-white hover:text-mynt-gray-200 transition-colors"
            title="Refresh Data"
          >
            <FaSync className={isLoading ? "animate-spin" : ""} size={16} />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-mynt-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mynt-green mx-auto"></div>
            <p className="mt-4 text-mynt-gray-400">Fetching your data...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Budget Overview */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-mynt-gray-500 mb-4">
              Budget Overview
            </h2>
            <div className="max-h-72 h-72 flex items-center justify-center text-mynt-gray-400">
              Coming Soon
            </div>
          </div>

          {/* Monthly Spending */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-mynt-gray-500 mb-4">
              Monthly Spending
            </h2>
            <div className="max-h-48 h-48 flex items-center justify-center text-mynt-gray-400">
              <ReactECharts
                className="w-full h-full"
                option={monthlySpendingOptions}
              />
            </div>
          </div>

          {/* Net Worth */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-mynt-gray-500 mb-4">
              Net Worth
            </h2>
            <div className="max-h-72 h-72 flex items-center justify-center text-mynt-gray-400">
              Coming Soon
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2
              className="text-xl font-semibold text-mynt-gray-500 mb-4 border-b-2 pb-4 border-mynt-gray-300 cursor-pointer"
              onClick={() => navigate("/transactions")}
            >
              Recent Transactions
            </h2>
            {transactions.length === 0 ? (
              <div className="max-h-48 h-48 flex items-center justify-center text-mynt-gray-400">
                No transactions found
              </div>
            ) : (
              <div className="max-h-72 h-72 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <tbody className="divide-y divide-mynt-gray-300">
                      {transactions
                        .slice()
                        .sort(
                          (a, b) =>
                            new Date(b.transDate).getTime() -
                            new Date(a.transDate).getTime()
                        )
                        .slice(0, 5)
                        .map((transaction: TransactionItem) => (
                          <tr key={transaction.transactionId}>
                            <td className="py-2 text-sm">
                              <div className="font-medium text-mynt-gray-500">
                                {transaction.transMerchant}
                              </div>
                              <div className="text-mynt-gray-400 text-xs">
                                {new Date(
                                  transaction.transDate
                                ).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="py-3 text-right">
                              <span
                                className={`font-medium ${
                                  transaction.transAmount > 0
                                    ? "text-mynt-gray-400"
                                    : "text-green-500"
                                }`}
                              >
                                ${Math.abs(transaction.transAmount).toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
