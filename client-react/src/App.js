import Login from "./components/Login";
import Signup, {action as manipulateFormAction}from "./components/SignUp";
import StocksList from "./components/StocksList";
import { createBrowserRouter,RouterProvider } from "react-router-dom";
import LoginPage ,{action as loginAction}from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import StocksPage from "./pages/StocksPage";
import NavBarRoot from "./pages/NavBarRoot";
import EditUserPage ,{loader as editLoadData}from "./pages/EditUserPage";
import AddStockPage,{action as addStockAction} from "./pages/AddStockPage";
import ShowStocksPage,{loader as showLoader} from "./pages/ShowStocksPage";



const router=createBrowserRouter([
  
  {path:'/',element:<LoginPage/>,
    action:loginAction},
  {path:'/signup',element:<SignUpPage/>,
    action:manipulateFormAction
  },
  {path: '/',element:<NavBarRoot/>,
    children:[
      {path:'home',element:<StocksPage/>,
        
      },
      {path:'show',element:<ShowStocksPage/>,loader:showLoader},

      
      {path:'edit',element:<EditUserPage/>,
        //path:'edit/:editId'
        loader:editLoadData,
        action:manipulateFormAction
      },
      { path: "add-stock", 
        element: <AddStockPage />,
         action:addStockAction},
    ]
  }
  
])
function App() {
  return (
    <RouterProvider router={router}/>
  );
}

export default App;
