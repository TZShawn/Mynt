import React from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { Account } from '../store/accountsSlice';

interface NetworthData {
  date: string;
  networth: number;
  accounts: Account[];
}

interface NetworthModuleProps {
  networthHistory: NetworthData[];
}

const NetworthModule: React.FC<NetworthModuleProps> = ({ networthHistory }) => {
  const getChartOptions = (): EChartsOption => {
    const dates = networthHistory.map(data => data.date.split('T')[0]);
    const values = networthHistory.map(data => data.networth);

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const date = params[0].axisValue;
          const value = params[0].data;
          return `${date}<br/>Networth: $${value.toFixed(2)}`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => `$${value.toFixed(0)}`
        }
      },
      series: [
        {
          name: 'Networth',
          type: 'line',
          data: values,
          areaStyle: {},
          color: '#2a9d74',
          showSymbol: false,
          emphasis: {
            focus: 'series'
          }
        }
      ]
    };
  };

  if (!networthHistory.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-mynt-gray-400">No networth data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <ReactECharts
        option={getChartOptions()}
        style={{ height: '300px' }}
      />
    </div>
  );
};

export default NetworthModule; 