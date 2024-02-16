import { useEffect, useState } from "react";
import { apiFetch } from "../helpers/api";
import { Loader } from "../ui/Loader/Loader";
import { LoginForm } from "./LoginForm";
import { Site } from "./Site";

export default function App() {
  const [user, setUser] = useState(null);  

  useEffect(() => {
    (async () => {
      const user = await apiFetch('/me');
      setUser(user);
    })();
  }, []);

  if(user === null) {
    return <div className="container" style={{marginTop: '40px', textAlign: 'center'}}>
      <Loader>authentification en cours...</Loader>
    </div>
  }
  
  return user ? <Site user={user} /> : <LoginForm setUser={setUser} /> ;
  

}





