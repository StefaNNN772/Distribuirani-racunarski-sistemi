import { jwtDecode } from "jwt-decode";

export default function getAuthToken(){
    const token=localStorage.getItem('token');
    return token;
}

export const setToken = (token) => {
  localStorage.setItem('token', token);
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

export const isTokenValid = () => {
  const token = getAuthToken();
  
  if (!token) {
    return false;
  }

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Current time in seconds
    
    if (decodedToken.exp < currentTime) {
      console.log('Session expired.');
      removeToken();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Fail while coding token: ', error);
    removeToken();
    return false;
  }
};

export const getUserFromToken = () => {
  const token = getAuthToken();
  
  if (!token || !isTokenValid()) {
    return null;
  }
  
  try {
    const decodedToken = jwtDecode(token);
    return {
      id: decodedToken.id,
      email: decodedToken.email,
    };
  } catch (error) {
    console.error('Greška pri dobijanju korisnika iz tokena:', error);
    return null;
  }
};

export const isTokenExpiringSoon = () => {
  const token = getAuthToken();
  
  if (!token) {
    return false;
  }

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = decodedToken.exp - currentTime;
    
    // 300s (5 minutes) until expiration of token
    return timeUntilExpiry < 300 && timeUntilExpiry > 0;
  } catch (error) {
    console.error('Greška pri proveri isteka tokena:', error);
    return false;
  }
};    