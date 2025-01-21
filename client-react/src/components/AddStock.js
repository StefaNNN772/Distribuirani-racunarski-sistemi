import { Form } from "react-router-dom";
import { Link } from "react-router-dom";

export default function AddStock() {
    return (    
        <Form method = "POST"  >
        <h1>Add Stock Transaction</h1>
          <div className="control">
            <label htmlFor="stockName">Stock Name</label>
            <input
              type="text"
              id="stockName"
              name="stockName"
              required
              
            />
          </div>
          <div className="control">
            <label htmlFor="transactionType">Transaction Type</label>
            <select
              id="transactionType"
              name="transactionType"
              required
            >
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>
          <div className="control">
            <label htmlFor="transactionDate">Transaction Date</label>
            <input
              type="datetime-local"
              id="transactionDate"
              name="transactionDate"
              required
            />
          </div>
          <div className="control">
            <label htmlFor="transactionQuantity">Transaction Quantity</label>
            <input
              type="number"
              id="transactionQuantity"
              name="transactionQuantity"
              required
            />
          </div>
          <div className="control">
            <label htmlFor="transactionValue">Transaction Value</label>
            <input
              type="number"
              id="transactionValue"
              name="transactionValue"
              required
            />
          </div>
          <p className="form-actions">
          <Link to='/home' className="button button-flat">Back</Link>
            <button
            type="submit"
            className="button">
            Submit
          </button>
          </p>
          
        </Form>
      
    );
  };