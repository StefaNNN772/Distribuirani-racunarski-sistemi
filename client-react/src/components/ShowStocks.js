export default function ShowStocks({ stocks }) {
  return (
    <div className="stocks-container">
      <h1>All Stocks</h1>
      <div className="cards-container">
        {stocks.map((stock) => (
          <div className="stock-card" key={stock.id}>
            <h2>{stock.stock_name}</h2>
            <p>Quantity: {stock.quantity}</p>
            <p>Purchase Price: ${stock.purchase_price}</p>
            <time>{stock.transaction_date}</time>
            <button className="button">More Info</button>
          </div>
        ))}
      </div>
    </div>
  );
}

    
              //{stock.stock_name} - Količina: {stock.quantity} - Cena: {stock.purchase_price}
  

