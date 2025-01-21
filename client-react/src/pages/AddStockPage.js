import { Form } from "react-router-dom";
import { useActionData } from "react-router-dom";
import { json } from "react-router-dom";
import { redirect } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export async function action({ request }) {
  const data = await request.formData();
  const token = localStorage.getItem("token"); // Uzima token iz LocalStorage
  const decodedToken = token ? jwtDecode(token) : null;
  const userId = decodedToken?.id;
  const authData = {
      user_id: userId,
      stockName: data.get('stockName'),
      transactionType: data.get('transactionType'),
      transactionDate: data.get('transactionDate'),
      transactionQuantity: data.get('transactionQuantity'),
      transactionValue: data.get('transactionValue'),
  };
    // Example API call
    const response = await fetch("http://localhost:5000/add-stock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(authData),
    });

        const resData = await response.json();
        console.log('Odgovor sa servera:', resData);
      return redirect("/home");
  };

  export default function AddStockPage() {
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1>Add Stock Transaction</h1>
      <Form method = "POST">
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="stockName">Stock Name:</label>
          <input
            type="text"
            id="stockName"
            name="stockName"
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="transactionType">Transaction Type:</label>
          <select
            id="transactionType"
            name="transactionType"
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="transactionDate">Transaction Date:</label>
          <input
            type="datetime-local"
            id="transactionDate"
            name="transactionDate"
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="transactionQuantity">Transaction Quantity:</label>
          <input
            type="number"
            id="transactionQuantity"
            name="transactionQuantity"
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="transactionValue">Transaction Value:</label>
          <input
            type="number"
            id="transactionValue"
            name="transactionValue"
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <button
          type="submit"
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "10px 20px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Submit
        </button>
      </Form>
    </div>
  );
};
