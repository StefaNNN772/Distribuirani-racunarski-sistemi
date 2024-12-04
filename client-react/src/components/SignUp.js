import { Link, Form, redirect, useActionData, json } from "react-router-dom";

import Header from "./Header";
export default function Signup({title,method}) {

  const data = useActionData();
  
    return (
      <>

        <Header/>
        
        <Form className="control" method={method}>
        <h1>{title}</h1>
        <div className="control">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" name="email" required 
          
          />
        </div>
  
        <div className="control">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" name="password" required 
         
          
          />
        </div>
  
        <hr />
        <div className="control-row">
          <div className="control">
            <label htmlFor="first_name">First Name</label>
            <input id="first_name" type="text" name="first_name" required
            
            
            />
          </div>
  
          <div>
            <label htmlFor="last_name">Last Name</label>
            <input id="last_name" type="text" name="last_name" required
            
            />
            
          </div>
        </div>
  
        <hr />
  
        <div className="control-row">
          <div className="control">
            <label htmlFor="address">Address</label>
            <input id="address" type="text" name="address" required
            
            
            />
          </div>
  
          <div>
            <label htmlFor="city">City</label>
            <input id="city" type="text" name="city" required 
            
            />
          </div>
        </div>
  
        <div className="control">
          <label htmlFor="country">Country</label>
          <input id="country" type="text" name="country" required 
         
          />
        </div>
        <div className="control">
          <label htmlFor="phone">Phone</label>
          <input id="phone" type="number" name="phone" required 
          
          />
        </div>

        {data?.error && <p style={{ color: "red" }}>{data.error}</p>} {/* Prikaz greške */}
  
        <p className="form-actions">
          <Link to='/' className="button button-flat">Back</Link>
          <button className="button">Sign up</button>
        </p>
      </Form>
      </>
      
    );
  }

  export async function action({request,params}){
    const method=request.method;
    const data=await request.formData();

    const signData={
      email:data.get('email'),
      password:data.get('password'),
      first_name:data.get('first_name'),
      last_name:data.get('last_name'),
      address:data.get('address'),
      city:data.get('city'),
      country:data.get('country'),
      phone:data.get('phone'),

    };

    let url='http://localhost:5000/signup';
    if(method==='PATCH'){
      const id=params.editId;
      url='http://localhost:5000/edit/'+id;
    }
    const response=await fetch(url,{
      method:method,
      headers:{
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signData),
    });

    if(!response.ok){
      const errorData = await response.json();
      return json({ error: errorData.Error || "Form submission failed" }, { status: response.status });
    }

    // if (response.status === 422) {
    //   const errorData = await response.json();
    //   console.error('Greška:', errorData.message || 'Neuspesno popunjeno');
    // }

    // if (response.status === 400) {
    //   const errorData = await response.json();
    //   console.error('Greška:', errorData.message || 'Neuspesno popunjeno');
    //   return redirect('/signup')
    // }

    // if (response.status === 409) {
    //   const errorData = await response.json();
    //   console.error('Greška:', errorData.message || 'Konflikt/Postoji korisnik sa tim email-om');
    //   return redirect('/signup')
    // }

    return redirect('/');
  }