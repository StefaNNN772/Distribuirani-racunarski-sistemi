import Header from "./Header";
import { Link, useActionData } from "react-router-dom";
import { Form } from "react-router-dom";

export default function Login() {
    const data = useActionData(); // Dohvatanje podataka iz action funkcije

    return (
        <>
            <Header />
            <Form method="POST">
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

                {data?.error && <p style={{ color: 'red' }}>{data.error}</p>} {/* Prikaz greške */}

                <p className="form-actions">
                    <Link className="button button-flat" to="/signup">Sign up</Link>
                    <button className="button">Login</button>
                </p>
            </Form>
        </>
    );
}
