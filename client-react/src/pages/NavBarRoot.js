import NavBar from "../components/NavBar";
import { Outlet } from "react-router-dom";
export  default function NavBarRoot(){
    return(<>
        <NavBar/>
        <main>
            <Outlet/>
        </main>
    </>);
}