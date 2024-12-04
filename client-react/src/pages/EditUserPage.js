import Signup from "../components/SignUp";

export default function EditUserPage(){

    
    return(
        <Signup title="Edit user" method="path" />
    );
}


/*export async function loader(){
    const response=await fetch('http://localhost:8080/');

    if(!response.ok){

    }
    else{
        const resData=await response.json();
        return resData.events;
    }
}
*/