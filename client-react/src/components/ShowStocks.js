function ShowStocks({ stocks }) {
    return (
      <div>
        <h1>Prikaz svih zaliha</h1>
        {stocks.length > 0 ? (
          <ul>
            {stocks.map((stock) => (
              <li key={stock.id}>
                <p><strong>Akcija:</strong> {stock.stockName}</p>
                <p><strong>Tip transakcije:</strong> {stock.transactionType}</p>
                <p><strong>Datum:</strong> {stock.transactionDate}</p>
                <p><strong>Količina:</strong> {stock.transactionQuantity}</p>
                <p><strong>Vrednost:</strong> {stock.transactionValue}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nema dostupnih zaliha za prikaz.</p>
        )}
      </div>
    );
  }
  
  export default ShowStocks;