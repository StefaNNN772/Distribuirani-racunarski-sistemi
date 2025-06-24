import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Stock.css';
import { Link } from 'react-router-dom';

export default function AddStock() {
  return (
    <div className="add-stock-container">
      <h2>Add New Stock</h2>
      <form className="add-stock-form" method='POST'>
        <div className="control">
          <label htmlFor="ticker">Ticker</label>
          <input id="ticker" type="text" name="ticker" required
          />
        </div>
        <div className="control">
          <label htmlFor="stockName">Stock name</label>
          <input id="stockName" type="text" name="stockName" required
          />
        </div>
        <div className="control">
          <label htmlFor="quantity">Quantity</label>
          <input id="quantity" type="number" name="quantity" required 
          />
        </div>
        <div className="control">
          <label htmlFor="transactionDate">Transaction Date</label>
          <input id="transactionDate" type="datetime-local" name="transactionDate" required 
          />
        </div>
        <Link to='/home' className="button button-flat">Back</Link>
        <button type="submit" className='button'>Add Stock</button>
      </form>
    </div>
  );
}
