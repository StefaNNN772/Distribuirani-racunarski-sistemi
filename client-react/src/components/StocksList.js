import classes from './StocksList.module.css';
import img1 from '../pictures/btc.png';
import img2 from '../pictures/images.png';
import NavBar from './NavBar';
import { useEffect,useState } from 'react';
import {Sparklines,SparklinesLine} from 'react-sparklines';



export default function StocksList(){

    const[cryptoData,setCryptoData]=useState([]);
    //const [loading, setLoading] = useState(true);

    
    useEffect(()=>{
        async function fetchCryptoData(){
            try{
                const response=await fetch(
                    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true"
                );
                if(!response.ok){
                    throw new Error("greska pri dohvatanju");
                }
                const data=await response.json();
                setCryptoData(data);
                //setLoading(false);

            }
            catch(error){
                console.error("greska",error);
            }
           
            
        }
        fetchCryptoData();
    },[])

    //if (loading) return <p>Loading...</p>;

    return(
        <>
            
            <div>
      <h1>Current prices</h1>
      <table id="result">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Price (USD)</th>
            <th>Change (24h)</th>
            <th>Price Trend</th>
          </tr>
        </thead>
        <tbody>
          {cryptoData.map((crypto) => (
            <tr key={crypto.id}>
                <td>
                    <img src={crypto.image} className="small-img"/>
                </td>
              <td>{crypto.name}</td>
              <td>${crypto.current_price.toFixed(2)}</td>
              <td
                style={{
                  color: crypto.price_change_percentage_24h > 0 ? "green" : "red",
                }}
              >
                {crypto.price_change_percentage_24h.toFixed(2)}%
              </td>
              <td>
                <Sparklines data={crypto.sparkline_in_7d.price}>
                    <SparklinesLine color={crypto.price_change_percentage_24h > 0 ? "green" : "red"}/>
                </Sparklines>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
        </>
        
    );
}