import Header from "./Header";
import { Link } from "react-router-dom";
import { Form } from "react-router-dom";
export default function Login() {

  
    return (
      <>
      <Header/>
      <Form method = 'POST'>
        <h1>Login</h1>
  
        <div className="control-row">
          <div className="control no-margin">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" name="email" required />
          </div>
  
          <div className="control no-margin">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" name="password" required />
          </div>
        </div>
  
        <p className="form-actions">
          <Link className="button button-flat" to='/signup'>Sign up</Link>
          <button className="button">Login</button>
        </p>
      </Form>
   </>     
      
      
        
    );
  }