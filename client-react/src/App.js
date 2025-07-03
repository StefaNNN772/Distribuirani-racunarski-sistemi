import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage, { action as loginAction } from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import HomePage, { loader as homeLoader } from "./pages/HomePage";
import NavBarRoot from "./pages/NavBarRoot";
import TransactionPage, { action as transactionAction } from './pages/TransactionPage';
import EditUserPage, { loader as editLoadData } from "./pages/EditUserPage";
import { action as manipulateFormAction } from "./components/SignUp";
import ProtectedRoute from "./components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
    action: loginAction
  },
  {
    path: '/signup',
    element: <SignUpPage />,
    action: manipulateFormAction
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <NavBarRoot />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'home',
        element: <HomePage/>,
        loader: homeLoader
      },
      {
        path: 'edit',
        element: <EditUserPage />,
        loader: editLoadData,
        action: manipulateFormAction
      },
      {
        path: 'transaction',
        element: <TransactionPage />,
        action: transactionAction,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;