import logoImg from '../pictures/btc.png';


export default function Header(){
    return(
        <header>
            <img src={logoImg}/>
            <h1>Crypto Portfolio</h1>
        </header>
        );
}