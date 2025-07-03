import { Link, useLocation, useNavigate } from 'react-router-dom';
import { removeToken } from '../util/auth';
import stockImage from '../pictures/stock.jpg'

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    navigate('/');
  };

  return (
    <header>
      <div className="navbar-content">
        <img 
          src={stockImage} 
          alt="Portfolio Logo" 
          className="small-img"
        />
        <a href="/app/home">Portfolio Tracker</a>
      </div>
      
      <nav>
        <div className="list">
          <Link 
            to="/app/home" 
            className={location.pathname === '/app/home' ? 'active' : ''}
          >
            Portfolio
          </Link>
          <Link 
            to="/app/transaction" 
            className={location.pathname === '/app/transaction' ? 'active' : ''}
          >
            Add Transaction
          </Link>
          <Link 
            to="/app/edit" 
            className={location.pathname === '/app/edit' ? 'active' : ''}
          >
            Edit Profile
          </Link>
          <button 
            onClick={handleLogout} 
            className="button button-flat logout-btn"
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
}