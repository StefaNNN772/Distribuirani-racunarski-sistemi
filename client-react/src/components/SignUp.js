import { Link } from "react-router-dom";
import Header from "./Header";
export default function Signup({title}) {
    return (
      <>

        <Header/>
        
        <form className="control">
        <h1>{title}</h1>
        <div className="control">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" name="email" required />
        </div>
  
        <div className="control">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" name="password" required />
        </div>
  
        <hr />
        <div className="control-row">
          <div className="control">
            <label htmlFor="first-name">First Name</label>
            <input id="first-name" type="text" name="first-name" required />
          </div>
  
          <div>
            <label htmlFor="last-name">Last Name</label>
            <input id="last-name" type="text" name="last-name" required />
          </div>
        </div>
  
        <hr />
  
        <div className="control-row">
          <div className="control">
            <label htmlFor="address">Address</label>
            <input id="address" type="text" name="address" required />
          </div>
  
          <div>
            <label htmlFor="city">City</label>
            <input id="city" type="text" name="city" required />
          </div>
        </div>
  
        <div className="control">
          <label htmlFor="country">Country</label>
          <input id="country" type="text" name="country" required />
        </div>
        <div className="control">
          <label htmlFor="phone">Phone</label>
          <input id="phone" type="number" name="phone" required />
        </div>
  
        <p className="form-actions">
          <Link to='/' className="button button-flat">Back</Link>
          <button className="button">Sign up</button>
        </p>
      </form>
      </>
      
    );
  }