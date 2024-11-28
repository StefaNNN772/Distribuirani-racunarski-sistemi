import Login from "../components/Login";
import { redirect } from "react-router-dom";
export default function LoginPage(){
    return(<Login/>)
}

export async function action({request}){
    const data=await request.formData();
    const authData={
        email:data.get('email'),
        password:data.get('password'),
    };

    const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(authData)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        console.error('Greška:', errorData.message || 'Neuspela autentifikacija');
        return redirect("/login");
    } else {
        console.log('Ulogovan korisnik:', await response.json());
    }

    return redirect("/");
}