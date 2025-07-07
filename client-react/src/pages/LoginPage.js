import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/Login";
import { json, redirect } from "react-router-dom";
import { setToken, isTokenValid } from "../util/auth";

export default function LoginPage() {
    const navigate = useNavigate();

    useEffect(() => {
        // Already has valid token
        if (isTokenValid()) {
            navigate('/app/home');
        }
    }, [navigate]);

    return <Login />;
}

export async function action({ request }) {
    const data = await request.formData();
    const authData = {
        email: data.get('email'),
        password: data.get('password'),
    };

    try {
        const API_URL = process.env.REACT_APP_API_URL;
        const response = await fetch(`${API_URL}/login`, {
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
        const token = resData.access_token;
        
        if (token) {
            setToken(token); // Setting token with util function
            console.log('Token saved:', token);
            return redirect("/app/home");
        } else {
            return json({ error: 'Authentication failed' }, { status: 400 });
        }
    } catch (error) {
        console.error('Login error:', error);
        return json({ error: 'Network error. Please try again.' }, { status: 500 });
    }
}