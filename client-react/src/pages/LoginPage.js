import Login from "../components/Login";
import { json, redirect } from "react-router-dom";

export default function LoginPage() {
    return <Login />;
}

export async function action({ request }) {
    const data = await request.formData();
    const authData = {
        email: data.get('email'),
        password: data.get('password'),
    };

    const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(authData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        return json({ error: errorData.Error || 'Authentication failed' }, { status: response.status });
    }

    const resData = await response.json();
    console.log('Odgovor sa servera:', resData);

    // Proverite da li postoji access_token u odgovoru
    const token = resData.access_token;  // Pristupite access_token iz odgovora
    if (token) {
        localStorage.setItem('token', token);  // Sačuvajte token u localStorage
        console.log('Token je sačuvan:', token);
    } else {
        console.error('Token nije pronađen u odgovoru');
    }

    return redirect("/home");
}
