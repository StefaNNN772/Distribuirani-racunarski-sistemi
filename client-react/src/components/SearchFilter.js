import { useState } from 'react';

export default function SearchFilter({ onFilter }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onFilter(value, sortBy);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    onFilter(searchTerm, value);
  };

  return (
    <div className="search-filter">
      <div className="search-controls">
        <div className="control">
          <label htmlFor="search">Search Stocks</label>
          <input
            id="search"
            type="text"
            placeholder="Search by stock symbol..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="control">
          <label htmlFor="sort">Sort By</label>
          <select id="sort" value={sortBy} onChange={handleSortChange}>
            <option value="">Default</option>
            <option value="name">Stock Name</option>
            <option value="value">Current Value</option>
            <option value="profit">Profit/Loss</option>
          </select>
        </div>
      </div>
    </div>
  );
}