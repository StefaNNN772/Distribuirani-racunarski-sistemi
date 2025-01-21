import { useLoaderData } from "react-router-dom";
import ShowStocks from '../components/ShowStocks'
import { json } from "react-router-dom";

export default function ShowStocksPage() {
  // Učitavanje podataka sa servera pomoću React Router-ove funkcije `useLoaderData`
  const stocks = useLoaderData();

  return <ShowStocks stocks={stocks} />;
}

// Loader funkcija za preuzimanje podataka sa servera
export async function loader() {
  const response = await fetch("http://localhost:5000/get-stock", {
    
  });

  if (!response.ok) {
    // Ako server ne vrati uspešan odgovor, baca grešku
    throw json({ message: "Nije moguće učitati podatke o zalihama." }, { status: 500 });
  }

  // Parsiranje odgovora sa servera
  const data = await response.json();
  console.log(data);
  return data; // Vraća podatke za `useLoaderData`
}