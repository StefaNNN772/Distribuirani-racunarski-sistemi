import { NavLink } from 'react-router-dom';
import logoImg from '../pictures/btc.png';
import { jwtDecode } from 'jwt-decode';

export default function NavBar(){

   /* const token = localStorage.getItem("token"); // Uzima token iz LocalStorage
    const decodedToken = token ? jwtDecode(token) : null; // Dekodira token
  
    // Dodajte debug ispis ovde:
    console.log("Token from localStorage:", token);
    console.log("Decoded Token:", decodedToken);
  
    const userId = decodedToken?.sub; // Dobija `id` iz dekodiranog tokena
   */
    // Još jedan debug ispis za `userId`:
   // console.log("User ID:", userId);
    return(
      <header >
        <nav>
            <ul className='list'>
                <li >
                    <NavLink to='/home'
                    className={({isActive})=> isActive ? 'active' : undefined}
                    end>Home</NavLink>
                </li>
                <li>
                    <NavLink  to='edit'
                    //to={`edit/${userId}`}
                    className={({isActive})=> isActive ? 'active' : undefined}
                    end
                    >User Edit</NavLink>
                </li>
               
            </ul>
        </nav>
      </header>
    );
}