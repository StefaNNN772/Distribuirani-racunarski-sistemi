import Signup from "../components/SignUp";
import { json, useLoaderData } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function EditUserPage(){
    const userData=useLoaderData();
    return(
        <Signup title="Edit user" button="Update" method="patch" userData={userData}   />
    );
}


export async function loader({request,params}){
  const token = localStorage.getItem("token"); // Uzima token iz LocalStorage
    const decodedToken = token ? jwtDecode(token) : null; // Dekodira token
  
    // Dodajte debug ispis ovde:
    console.log("Token from localStorage:", token);
    console.log("Decoded Token:", decodedToken);

    if (!decodedToken) {
      throw new Error("No valid token found.");
    }
  
    const userId = decodedToken?.id; // Dobija `id` iz dekodiranog tokena
    
    const API_URL = process.env.REACT_APP_API_URL;
    const response = await fetch(`${API_URL}/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Ako je potrebno, dodajte Authorization header
      }
    });

    if(!response.ok){
      throw json({message: 'Could not fetch user data'},{status:500});
    }
    const userData = await response.json(); // Dobijeni podaci sa servera
    console.log("User Data:", userData);
  
    return userData;
}
