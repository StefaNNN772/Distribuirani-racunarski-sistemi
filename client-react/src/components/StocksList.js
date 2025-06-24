import { useEffect, useState } from 'react';
import NavBar from './NavBar';
import { Link } from 'react-router-dom';
import './Stock.css'


export default function StocksList(){
    const [stocks, get_stocks] = useState([])

    useEffect (() => {
        fetch('api/stocks')
            .then(res => res.json())
            .then(data => get_stocks(data))
            .catch(err => console.error("Failed to fetch stocks:",err));
    },[])

    return(
        <>
        <h1>My portfolio</h1>
      
    <table className='stocks-table'>
        <thead>
            <tr>
                <th>Ticker</th>
                <th>Stock name</th>
                <th>Current price</th>
                <th>Quantity</th>
                <th>Bought price</th>
                <th>Gain</th>
                <th>Trend(24h)</th>
            </tr>
        </thead>
        <tbody>
            {stocks.map((stock, index) => (
                <tr key={index}>
                    <td>{stock.ticker}</td>
                    <td>{stock.name}</td>
                    <td>{stock.current_price || 'N/A'}</td>
                    <td>{stock.quantity}</td>
                    <td>{stock.bought_price || 'N/A'}</td>
                    <td>{stock.gain || 'N/A'}</td>
                    <td>{stock.trend_24h || 'N/A'}</td>
                </tr>
            )
            
        
        )

            }
        </tbody>
    </table>      

    <div className='addPortfolio_button'>
      <Link className="button button-flat" to="/addStock">Add stock</Link>
    </div>
        </>
    );
}