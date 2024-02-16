import { useEffect } from "react";
import { useState } from "react";

export function Test() {
    const users = useFetch('https://jsonplaceholder.typicode.com/users');

    return (
        users !== null && (
            <ul>
            {
                users.map(user => (
                    <li key={user.id}>{user.name} {user.username} {user.email}</li>
                ))
            }
            </ul>
        )
    )
}



const useFetch = entrypoint => {
    const [data, setData] = useState(null);



    useEffect(() => {
        fetch(entrypoint, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(result => setData(result));
    }, [entrypoint]);


    return data;
} 