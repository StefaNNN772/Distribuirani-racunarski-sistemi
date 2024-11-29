import Login from "./components/Login";
import Signup, {action as manipulateFormAction}from "./components/SignUp";
import StocksList from "./components/StocksList";
import { createBrowserRouter,RouterProvider } from "react-router-dom";
import LoginPage ,{action as loginAction}from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import StocksPage from "./pages/StocksPage";
import NavBarRoot from "./pages/NavBarRoot";
import EditUserPage from "./pages/EditUserPage";


const router=createBrowserRouter([
  
  {path:'/',element:<LoginPage/>,
    action:loginAction},
  {path:'/signup',element:<SignUpPage/>,
    action:manipulateFormAction
  },
  {path: '/',element:<NavBarRoot/>,
    children:[
      {path:'home',element:<StocksPage/>},
      {path:'edit/:editId',element:<EditUserPage/>,
        action:manipulateFormAction
      }
    ]
  }
  
])
function App() {
  return (
    <RouterProvider router={router}/>
  );
}

export default App;
