import { useLoaderData } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import StockCard from '../components/StockCard';
import SearchFilter from '../components/SearchFilter';
import PortfolioSummary from '../components/PortfolioSummary';
import StockChart from '../components/StockChart';
import StockPriceChart from '../components/StockPriceChart';
import { jwtDecode } from "jwt-decode";
import websocketService from '../services/websocketService';

export default function StocksPage() {
  const initialData = useLoaderData();
  const [stocks, setStocks] = useState(initialData.stocks);
  const [portfolioValue, setPortfolioValue] = useState(initialData.portfolioValue);
  const [totalProfit, setTotalProfit] = useState(initialData.totalProfit);
  const [filteredStocks, setFilteredStocks] = useState(initialData.stocks);
  const [selectedStock, setSelectedStock] = useState(null);

  // Get user ID from token
  const getUserId = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken?.id;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }, []);

  // WebSocket event handlers
  const handleStockAdded = useCallback((data) => {
    console.log('Handling stock added:', data);
    if (data.portfolio_data) {
      setStocks(data.portfolio_data.stocks || []);
      setPortfolioValue(data.portfolio_data.portfolioValue || 0);
      setTotalProfit(data.portfolio_data.totalProfit || 0);
    }
  }, []);

  const handleStockDeleted = useCallback((data) => {
    console.log('Handling stock deleted:', data);
    if (data.portfolio_data) {
      setStocks(data.portfolio_data.stocks || []);
      setPortfolioValue(data.portfolio_data.portfolioValue || 0);
      setTotalProfit(data.portfolio_data.totalProfit || 0);
    }
  }, []);

  const handlePricesUpdated = useCallback((data) => {
    console.log('Handling prices updated:', data);
    if (data.prices) {
      setStocks(prevStocks => 
        prevStocks.map(stock => {
          const updatedPrice = data.prices[stock.stock_name.toUpperCase()];
          if (updatedPrice) {
            const quantity = parseFloat(stock.quantity);
            const purchasePrice = parseFloat(stock.purchase_price);
            
            let profit;
            if (stock.is_sold) {
              const investedAmount = purchasePrice * quantity;
              const currentValue = updatedPrice * quantity;
              profit = investedAmount - currentValue;
            } else {
              const investedAmount = purchasePrice * quantity;
              const currentValue = updatedPrice * quantity;
              profit = currentValue - investedAmount;
            }
            
            return {
              ...stock,
              current_price: updatedPrice,
              profit: Math.round(profit * 100) / 100
            };
          }
          return stock;
        })
      );
      
      // Recalculate portfolio totals
      setStocks(prevStocks => {
        let newTotalValue = 0;
        let newTotalProfit = 0;
        
        const updatedStocks = prevStocks.map(stock => {
          const quantity = parseFloat(stock.quantity);
          const purchasePrice = parseFloat(stock.purchase_price);
          const currentPrice = stock.current_price;
          
          if (stock.is_sold) {
            const investedAmount = purchasePrice * quantity;
            newTotalValue += investedAmount;
            newTotalProfit += stock.profit;
          } else {
            const currentValue = currentPrice * quantity;
            newTotalValue += currentValue;
            newTotalProfit += stock.profit;
          }
          
          return stock;
        });
        
        setPortfolioValue(Math.round(newTotalValue * 100) / 100);
        setTotalProfit(Math.round(newTotalProfit * 100) / 100);
        
        return updatedStocks;
      });
    }
  }, []);

  const handleConnectionError = useCallback((error) => {
    console.error('WebSocket connection error:', error);
  }, []);

  // Funkcija za fetch podataka (fallback)
  const fetchStocksData = async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      const API_URL = process.env.REACT_APP_API_URL;
      const decodedToken = jwtDecode(token);
      const userId = decodedToken?.id;
      
      const response = await fetch(`${API_URL}/stocks/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Could not fetch stocks data');
      }
      
      const data = await response.json();
      
      setStocks(data.stocks || []);
      setPortfolioValue(data.portfolioValue || 0);
      setTotalProfit(data.totalProfit || 0);
      
    } catch (error) {
      console.error('Error fetching stocks:', error);
    }
  };

  // WebSocket connection setup
  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;

    const API_URL = process.env.REACT_APP_API_URL;
    
    // Connect to WebSocket
    websocketService.connect(API_URL);
    websocketService.joinUserRoom(userId);
    
    // Set up event listeners
    websocketService.on('stock_added', handleStockAdded);
    websocketService.on('stock_deleted', handleStockDeleted);
    websocketService.on('prices_updated', handlePricesUpdated);
    websocketService.on('connection_error', handleConnectionError);

    // Fallback polling (less frequent since we have WebSocket)
    const fallbackInterval = setInterval(fetchStocksData, 60000);

    // Cleanup
    return () => {
      websocketService.off('stock_added', handleStockAdded);
      websocketService.off('stock_deleted', handleStockDeleted);
      websocketService.off('prices_updated', handlePricesUpdated);
      websocketService.off('connection_error', handleConnectionError);
      websocketService.leaveUserRoom(userId);
      clearInterval(fallbackInterval);
    };
  }, [getUserId, handleStockAdded, handleStockDeleted, handlePricesUpdated, handleConnectionError]);

  // Update filtered stocks when stocks change
  useEffect(() => {
    setFilteredStocks(stocks);
  }, [stocks]);

  const handleFilter = (searchTerm, sortBy) => {
    let filtered = stocks.filter(stock =>
      stock.stock_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === 'name') {
      filtered.sort((a, b) => a.stock_name.localeCompare(b.stock_name));
    } else if (sortBy === 'value') {
      filtered.sort((a, b) => (b.quantity * b.current_price) - (a.quantity * a.current_price));
    } else if (sortBy === 'profit') {
      filtered.sort((a, b) => b.profit - a.profit);
    }

    setFilteredStocks(filtered);
  };

  const handleStockClick = (stock) => {
    setSelectedStock(stock);
  };

  const handleCloseChart = () => {
    setSelectedStock(null);
  };

  return (
    <div className="portfolio-container">
      <PortfolioSummary 
        portfolioValue={portfolioValue}
        totalProfit={totalProfit}
        stockCount={stocks.length}
      />
      
      <SearchFilter onFilter={handleFilter} />
      
      <div className="portfolio-content">
        <div className="stocks-list">
          <h2>Your Stocks</h2>
          {filteredStocks.length === 0 ? (
            <p className="no-stocks">No stocks in your portfolio yet. Start by adding your first transaction!</p>
          ) : (
            <div className="stocks-grid">
              {filteredStocks.map(stock => (
                <StockCard 
                  key={stock.id} 
                  stock={stock} 
                  onStockClick={handleStockClick}
                />
              ))}
            </div>
          )}
        </div>
        
        {stocks.length > 0 && (
          <div className="charts-section">
            <StockChart stocks={stocks} />
          </div>
        )}
      </div>
      
      {selectedStock && (
        <StockPriceChart 
          stock={selectedStock} 
          onClose={handleCloseChart}
        />
      )}
    </div>
  );
}

// Keep the existing loader function unchanged
export async function loader() {
  const token = localStorage.getItem("token");
  
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const decodedToken = jwtDecode(token);
    const userId = decodedToken?.id;
    const API_URL = process.env.REACT_APP_API_URL;
    
    const response = await fetch(`${API_URL}/stocks/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!response.ok) {
      throw new Error('Could not fetch stocks data');
    }
    
    const data = await response.json();
    
    return {
      stocks: data.stocks || [],
      portfolioValue: data.portfolioValue || 0,
      totalProfit: data.totalProfit || 0,
      last_updated: data.last_updated || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error loading stocks:', error);
  }
}