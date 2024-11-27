import Login from "./components/Login";
import Signup from "./components/SignUp";
import StocksList from "./components/StocksList";
import { createBrowserRouter,RouterProvider } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import StocksPage from "./pages/StocksPage";
import NavBarRoot from "./pages/NavBarRoot";
import EditUserPage from "./pages/EditUserPage";

const router=createBrowserRouter([
  
  {path:'/',element:<LoginPage/>},
  {path:'/signup',element:<SignUpPage/>},
  {path: '/home',element:<NavBarRoot/>,
    children:[
      {path:'',element:<StocksPage/>},
      {path:'edit',element:<EditUserPage/>}
    ]
  }
  
])
function App() {
  return (
    <RouterProvider router={router}/>
  );
}

export default App;
