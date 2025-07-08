import { useState } from 'react';

export default function StockCard({ stock, onStockClick }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete this ${stock.stock_name} transaction?`)) {
      return;
    }

    setIsDeleting(true);
    
    try {
      const API_URL = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API_URL}/deleteStocks/${stock.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Don't reload the page - WebSocket will handle the update
        console.log('Transaction deleted successfully');
      } else {
        throw new Error('Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCardClick = (e) => {
    // Can't click on delete button
    if (e.target.closest('.delete-btn')) {
      return;
    }
    onStockClick(stock);
  };

  const currentValue = stock.quantity * stock.current_price;
  const purchaseValue = stock.quantity * stock.purchase_price;
  const profitLoss = stock.is_sold ? purchaseValue - currentValue : currentValue - purchaseValue;
  const profitPercentage = ((profitLoss / purchaseValue) * 100).toFixed(2);

  return (
    <div className="stock-card clickable" onClick={handleCardClick}>
      <div className="stock-header">
        <h3>{stock.stock_name}</h3>
        <button 
          className="delete-btn" 
          onClick={handleDelete}
          disabled={isDeleting}
          title="Delete transaction"
        >
          {isDeleting ? '...' : '×'}
        </button>
      </div>
      
      <div className="stock-details">
        <div className="detail-row">
          <span>Quantity:</span>
          <span>{stock.quantity} shares</span>
        </div>
        
        <div className="detail-row">
          <span>{stock.is_sold ? 'Sell Price:' : 'Purchase Price:'}</span>
          <span>${stock.purchase_price.toFixed(2)}</span>
        </div>
        
        <div className="detail-row">
          <span>Current Price:</span>
          <span>${stock.current_price.toFixed(2)}</span>
        </div>
        
        <div className="detail-row">
          <span>Current Value:</span>
          <span>${currentValue.toFixed(2)}</span>
        </div>
        
        <div className={`detail-row profit-loss ${profitLoss >= 0 ? 'profit' : 'loss'}`}>
          <span>P&L:</span>
          <span>
            ${profitLoss.toFixed(2)} ({profitPercentage}%)
          </span>
        </div>
        
        <div className="detail-row">
          <span>Date:</span>
          <span>{new Date(stock.transaction_date).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="click-hint">
        <small>Click to view 30-day price chart</small>
      </div>
    </div>
  );
}