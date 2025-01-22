import { useActionData } from "react-router-dom";
import { json } from "react-router-dom";
import { redirect } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import AddStock from '../components/AddStock'

export default function AddStockPage(){
  return(
     <AddStock/> 
    );

}

export async function action({ request }) {
  const data = await request.formData();
  const token = localStorage.getItem("token"); // Uzima token iz LocalStorage
  const decodedToken = token ? jwtDecode(token) : null;
  if (!decodedToken) {
    throw new Error("Invalid or missing token");
}
  const userId = decodedToken?.id;
  const authData = {
      user_id: userId,
      stockName: data.get('stockName'),
      transactionType: data.get('transactionType'),
      transactionDate: data.get('transactionDate'),
      transactionQuantity: data.get('transactionQuantity'),
      transactionValue: data.get('transactionValue'),
  };
  console.log("Podaci za slanje:", JSON.stringify(authData));

    // Example API call
    const response = await fetch("http://localhost:5000/add-stock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(authData),
    });

    if(!response.ok){
        throw json({message: 'Could not save event.'},{status:500});

    }

        const resData = await response.json();
        console.log('Odgovor sa servera:', resData);
      return redirect("/home");
  };

  
