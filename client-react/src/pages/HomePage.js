import { useLoaderData } from 'react-router-dom';
import { useState, useEffect } from 'react';
import StockCard from '../components/StockCard';
import SearchFilter from '../components/SearchFilter';
import PortfolioSummary from '../components/PortfolioSummary';
import StockChart from '../components/StockChart';
import { jwtDecode } from "jwt-decode";

export default function StocksPage() {
  const initialData = useLoaderData();
  const [stocks, setStocks] = useState(initialData.stocks);
  const [portfolioValue, setPortfolioValue] = useState(initialData.portfolioValue);
  const [totalProfit, setTotalProfit] = useState(initialData.totalProfit);
  const [filteredStocks, setFilteredStocks] = useState(initialData.stocks);

  // Funkcija za fetch podataka
  const fetchStocksData = async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken?.id;
      
      const response = await fetch(`http://localhost:5000/stocks/${userId}`, {
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

  // Periodic calling backend
  useEffect(() => {
    // Every 10s
    const interval = setInterval(fetchStocksData, 10000);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

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
                <StockCard key={stock.id} stock={stock} />
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
    </div>
  );
}

export async function loader() {
  const token = localStorage.getItem("token");
  
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const decodedToken = jwtDecode(token);
    const userId = decodedToken?.id;
    
    const response = await fetch(`http://localhost:5000/stocks/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!response.ok) {
      throw new Error('Could not fetch stocks data');
    }
    
    const data = await response.json();
    console.log(data.totalProfit);
    console.log(data.portfolioValue);
    
    return {
      stocks: data.stocks || [],
      portfolioValue: data.portfolioValue || 0,
      totalProfit: data.totalProfit || 0
    };
  } catch (error) {
    console.error('Error loading stocks:', error);
  }
}