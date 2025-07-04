import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useState, useEffect } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function StockPriceChart({ stock, onClose }) {
  const [priceData, setPriceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStockPriceHistory();
    
    // Update chart every 60s
    const interval = setInterval(fetchStockPriceHistory, 60000);
    
    return () => clearInterval(interval);
  }, [stock.stock_name]);

  const fetchStockPriceHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(
        `http://localhost:5000/stocks/history/${encodeURIComponent(stock.stock_name)}/1mo`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch stock price history');
      }
      
      const data = await response.json();
      setPriceData(data.prices || []);
    } catch (error) {
      console.error('Error fetching stock price history:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Setting data for chart
  const chartData = {
    labels: priceData.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }),
    datasets: [
      {
        label: `${stock.stock_name} Price`,
        data: priceData.map(item => item.price),
        borderColor: 'rgba(20, 123, 115, 1)',
        backgroundColor: 'rgba(20, 123, 115, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
        pointBackgroundColor: 'rgba(20, 123, 115, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
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
        text: `${stock.stock_name} - 30 Days Price History`,
        color: '#d9e2f1',
        font: {
          size: 16,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        callbacks: {
          label: function(context) {
            return `Price: $${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          color: '#d9e2f1',
          callback: function(value) {
            return '$' + value.toFixed(2);
          },
        },
        grid: {
          color: 'rgba(217, 226, 241, 0.1)',
        },
        title: {
          display: true,
          text: 'Price ($)',
          color: '#d9e2f1',
        },
      },
      x: {
        ticks: {
          color: '#d9e2f1',
        },
        grid: {
          color: 'rgba(217, 226, 241, 0.1)',
        },
        title: {
          display: true,
          text: 'Date',
          color: '#d9e2f1',
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  return (
    <div className="stock-price-chart-overlay">
      <div className="stock-price-chart-container">
        <div className="chart-header">
          <h3>{stock.stock_name} - 30 Days Price Chart</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="chart-content">
          {isLoading && (
            <div className="loading-state">
              <p>Loading price history...</p>
            </div>
          )}
          
          {error && (
            <div className="error-state">
              <p>Error: {error}</p>
              <button onClick={fetchStockPriceHistory}>Retry</button>
            </div>
          )}
          
          {!isLoading && !error && priceData.length > 0 && (
            <div className="chart-wrapper">
              <Line data={chartData} options={chartOptions} />
            </div>
          )}
          
          {!isLoading && !error && priceData.length === 0 && (
            <div className="no-data-state">
              <p>No price history available for this stock.</p>
            </div>
          )}
        </div>
        
        <div className="chart-info">
          <div className="stock-summary">
            <div className="summary-item">
              <span>Current Price:</span>
              <span>${stock.current_price.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span>Your Shares:</span>
              <span>{stock.quantity}</span>
            </div>
            <div className="summary-item">
              <span>Total Value:</span>
              <span>${(stock.quantity * stock.current_price).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}