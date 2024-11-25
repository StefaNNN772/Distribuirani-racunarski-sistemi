import classes from './StocksList.module.css';
import img1 from '../pictures/btc.png';
import img2 from '../pictures/images.png';
import NavBar from './NavBar';

const stocks = [
    { name: 'Apple', price: 145.60,img:img1 },
    { name: 'Tesla', price: 273.50,img:img2 },
    { name: 'Amazon', price: 3335.30,img:img1 },
    { name: 'Microsoft', price: 299.80,img:img2 },
    { name: 'Google', price: 2793.50,img:img1 },
    { name: 'Meta', price: 343.60,img:img2 },
    { name: 'Netflix', price: 648.90,img:img1 },
    { name: 'Nvidia', price: 202.15 ,img:img2},
    { name: 'Intel', price: 56.72,img:img1 },
    { name: 'AMD', price: 122.44 ,img:img2},
  ];

export default function StocksList(){
    return(
        <>
            
            <table id="result">
            <thead>
                <tr>
                    <td>Logo</td>
                    <td>Name</td>
                    <td>Price</td>
                </tr>
            </thead>
            <tbody>
                {stocks.map((stock)=>(
                    <tr>
                       <td><img 
                       src={stock.img}
                       className='small-img'
                       /></td>
                        <td>{stock.name}</td>
                        <td>{stock.price}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        </>
        
    );
}