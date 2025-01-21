import { NavLink } from 'react-router-dom';
import logoImg from '../pictures/btc.png';
import { jwtDecode } from 'jwt-decode';

export default function NavBar(){

 
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
               <li>
                    <NavLink
                    to="/add-stock"
                    className={({isActive})=> isActive ? 'active' : undefined}
                    end
                    >
                        Add Stock
                    </NavLink>
               </li>
            </ul>
        </nav>
      </header>
    );
}