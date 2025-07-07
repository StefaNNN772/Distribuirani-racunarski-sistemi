import { Link, Form, redirect, useActionData, json } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Header from "./Header";

export default function Signup({ title, button, method, userData }) {
  const data = useActionData();

  return (
    <>
      <Header />
      
      <Form className="control" method={method}>
        <h1>{title}</h1>
        <div className="control">
          <label htmlFor="email">Email</label>
          <input 
            id="email" 
            type="email" 
            name="email" 
            required 
            defaultValue={userData?.email || ""}
          />
        </div>

        <div className="control">
          <label htmlFor="password">Password</label>
          <input 
            id="password" 
            type="password" 
            name="password" 
            required 
          />
        </div>

        <hr />
        <div className="control-row">
          <div className="control">
            <label htmlFor="first_name">First Name</label>
            <input 
              id="first_name" 
              type="text" 
              name="first_name" 
              required 
              defaultValue={userData?.first_name || ""}
            />
          </div>

          <div className="control">
            <label htmlFor="last_name">Last Name</label>
            <input 
              id="last_name" 
              type="text" 
              name="last_name" 
              required 
              defaultValue={userData?.last_name || ""}
            />
          </div>
        </div>

        <hr />

        <div className="control-row">
          <div className="control">
            <label htmlFor="address">Address</label>
            <input 
              id="address" 
              type="text" 
              name="address" 
              required 
              defaultValue={userData?.address || ""}
            />
          </div>

          <div className="control">
            <label htmlFor="city">City</label>
            <input 
              id="city" 
              type="text" 
              name="city" 
              required 
              defaultValue={userData?.city || ""}
            />
          </div>
        </div>

        <div className="control">
          <label htmlFor="country">Country</label>
          <input 
            id="country" 
            type="text" 
            name="country" 
            required 
            defaultValue={userData?.country || ""}
          />
        </div>
        
        <div className="control">
          <label htmlFor="phone">Phone</label>
          <input 
            id="phone" 
            type="number" 
            name="phone"
            min="0"
            required 
            defaultValue={userData?.phone || ""}
          />
        </div>

        {data?.error && <p style={{ color: "red" }}>{data.error}</p>}

        <p className="form-actions">
          <Link 
            to={button === 'Sign up' ? '/' : '/app/home'} 
            className="button button-flat"
          >
            Back
          </Link>
          <button className="button">{button}</button>
        </p>
      </Form>
    </>
  );
}

export async function action({ request, params }) {
  const method = request.method;
  const data = await request.formData();

  const signData = {
    email: data.get('email'),
    password: data.get('password'),
    first_name: data.get('first_name'),
    last_name: data.get('last_name'),
    address: data.get('address'),
    city: data.get('city'),
    country: data.get('country'),
    phone: data.get('phone'),
  };

  const API_URL = process.env.REACT_APP_API_URL;
  let url = `${API_URL}/signup`;
  let headers = {
    'Content-Type': 'application/json',
  };

  if (method === 'PATCH') {
    const token = localStorage.getItem("token");
    const decodedToken = token ? jwtDecode(token) : null;

    if (!decodedToken) {
      return json({ error: "No valid token found." }, { status: 401 });
    }

    console.log(decodedToken);

    const userId = decodedToken?.id;
    url = `${API_URL}/edit/${userId}`;
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: headers,
      body: JSON.stringify(signData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return json({ error: errorData.Error || "Form submission failed" }, { status: response.status });
    }

    return redirect(method === 'PATCH' ? '/app/home' : '/');
  } catch (error) {
    console.error('Form submission error:', error);
    return json({ error: 'Network error. Please try again.' }, { status: 500 });
  }
}