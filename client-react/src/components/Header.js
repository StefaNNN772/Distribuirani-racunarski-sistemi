import logoImg from '../pictures/stock.jpg';


export default function Header(){
    return(
        <header>
            <img src={logoImg}/>
            <h1>Stocks Portfolio</h1>
        </header>
        );
}