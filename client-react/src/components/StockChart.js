import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function StockChart({ stocks }) {
  // Portfolio value chart data
  const portfolioData = {
    labels: stocks.map(stock => stock.stock_name),
    datasets: [
      {
        label: 'Current Value',
        data: stocks.map(stock => stock.quantity * stock.current_price),
        backgroundColor: 'rgba(20, 123, 115, 0.8)',
        borderColor: 'rgba(20, 123, 115, 1)',
        borderWidth: 2,
      },
    ],
  };

  // Profit/Loss chart data
  const profitData = {
    labels: stocks.map(stock => stock.stock_name),
    datasets: [
      {
        label: 'Profit/Loss',
        data: stocks.map(stock => {
          const currentValue = stock.quantity * stock.current_price;
          const purchaseValue = stock.quantity * stock.purchase_price;
          return stock.is_sold ? purchaseValue - currentValue : currentValue - purchaseValue;
        }),
        backgroundColor: stocks.map(stock => {
          const currentValue = stock.quantity * stock.current_price;
          const purchaseValue = stock.quantity * stock.purchase_price;
          if (currentValue >= purchaseValue)
            {
              if (stock.is_sold)
              {
                return 'rgba(244, 67, 54, 0.8)';
              }
              else
              {
                return 'rgba(76, 175, 80, 0.8)';
              }
          }
          else
          {
              if (!stock.is_sold)
              {
                return 'rgba(244, 67, 54, 0.8)';
              }
              else
              {
                return 'rgba(76, 175, 80, 0.8)';
              }
          }
        }),
        borderColor: stocks.map(stock => {
          const currentValue = stock.quantity * stock.current_price;
          const purchaseValue = stock.quantity * stock.purchase_price;
          if (currentValue >= purchaseValue)
            {
              if (stock.is_sold)
              {
                return 'rgba(244, 67, 54, 0.8)';
              }
              else
              {
                return 'rgba(76, 175, 80, 0.8)';
              }
          }
          {
            if (!stock.is_sold)
              {
                return 'rgba(244, 67, 54, 0.8)';
              }
              else
              {
                return 'rgba(76, 175, 80, 0.8)';
              }
          }
        }),
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#d9e2f1',
        },
      },
      title: {
        display: true,
        color: '#d9e2f1',
      },
    },
    scales: {
      y: {
        ticks: {
          color: '#d9e2f1',
        },
        grid: {
          color: 'rgba(217, 226, 241, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#d9e2f1',
        },
        grid: {
          color: 'rgba(217, 226, 241, 0.1)',
        },
      },
    },
  };

  return (
    <div className="charts-container">
      <div className="chart-section">
        <h3>Portfolio Distribution</h3>
        <Bar data={portfolioData} options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Current Value by Stock'}}}} />
      </div>
      
      <div className="chart-section">
        <h3>Profit & Loss</h3>
        <Bar data={profitData} options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Profit/Loss by Stock'}}}} />
      </div>
    </div>
  );
}