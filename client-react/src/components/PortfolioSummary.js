export default function PortfolioSummary({ portfolioValue, totalProfit, stockCount }) {
  const profitPercentage = portfolioValue > 0 ? ((totalProfit / portfolioValue) * 100).toFixed(2) : -((totalProfit / portfolioValue) * 100).toFixed(2);

  return (
    <div className="portfolio-summary">
      <h2>Portfolio Overview</h2>
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Value (Paid/Sold)</h3>
          <p className="value">${portfolioValue.toFixed(2)}</p>
        </div>
        
        <div className="summary-card">
          <h3>Total P&L</h3>
          <p className={`value ${totalProfit >= 0 ? 'profit' : 'loss'}`}>
            ${totalProfit.toFixed(2)} ({profitPercentage}%)
          </p>
        </div>
        
        <div className="summary-card">
          <h3>Stocks Owned</h3>
          <p className="value">{stockCount}</p>
        </div>
      </div>
    </div>
  );
}