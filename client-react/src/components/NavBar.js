import { NavLink } from 'react-router-dom';
import logoImg from '../pictures/btc.png';
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
                    <NavLink to='edit'
                    className={({isActive})=> isActive ? 'active' : undefined}
                    end
                    >User Edit</NavLink>
                </li>
               
            </ul>
        </nav>
      </header>
    );
}