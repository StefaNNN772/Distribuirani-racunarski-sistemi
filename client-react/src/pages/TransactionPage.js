import { Form, Link, redirect, useActionData } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

export default function TransactionPage() {
  const data = useActionData();

  return (
    <Form className="control" method="post">
      <h1>Add New Transaction</h1>
      
      <div className="control">
        <label htmlFor="stock_name">Stock Symbol</label>
        <input 
          id="stock_name" 
          type="text" 
          name="stock_name" 
          required 
          placeholder="e.g., AAPL, GOOGL, TSLA"
        />
      </div>

      <div className="control-row">
        <div className="control">
          <label htmlFor="quantity">Quantity</label>
          <input 
            id="quantity" 
            type="number" 
            name="quantity" 
            required 
            min="1"
            className="no-arrows"
          />
        </div>

        <div className="control">
          <label htmlFor="price">Price per Share</label>
          <input 
            id="price" 
            type="number" 
            name="price" 
            required 
            step="0.01"
            min="0"
            className="no-arrows"
          />
        </div>
      </div>

      <div className="control-row">
        <div className="control">
          <label htmlFor="transaction_date">Transaction Date</label>
          <input 
            id="transaction_date" 
            type="date" 
            name="transaction_date" 
            required 
          />
        </div>

        <div className="control">
          <label htmlFor="transaction_time">Transaction Time</label>
          <input 
            id="transaction_time" 
            type="time" 
            name="transaction_time" 
            required 
          />
        </div>
      </div>

      <div className="control">
        <label htmlFor="transaction_type">Transaction Type</label>
        <select id="transaction_type" name="transaction_type" required>
          <option value="">Select type...</option>
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
      </div>

      {data?.error && <p style={{ color: "red" }}>{data.error}</p>}

      <p className="form-actions">
        <Link to="/app/home" className="button button-flat">Cancel</Link>
        <button className="button">Add Transaction</button>
      </p>
    </Form>
  );
}

export async function action({ request }) {
  const data = await request.formData();
  const token = localStorage.getItem("token");
  
  if (!token) {
    return { error: 'Authentication required' };
  }

  try {
    const decodedToken = jwtDecode(token);
    const userId = decodedToken?.id;

    // Kombinuj datum i vreme u jedan timestamp
    const transactionDate = data.get('transaction_date');
    const transactionTime = data.get('transaction_time');
    const combinedDateTime = `${transactionDate}T${transactionTime}:00.000Z`;

    const transactionData = {
      stock_name: data.get('stock_name').toUpperCase(),
      quantity: parseInt(data.get('quantity')),
      price: parseFloat(data.get('price')),
      transaction_date: combinedDateTime, // Šalje kombinovani datum i vreme
      transaction_type: data.get('transaction_type'),
      user_id: userId
    };

    console.log('Sending transaction data:', transactionData); // Za debug

    const response = await fetch('http://localhost:5000/addStocks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.message || 'Failed to add transaction' };
    }

    return redirect('/app/home');
  } catch (error) {
    console.error('Error adding transaction:', error);
    return { error: 'Network error. Please try again.' };
  }
}