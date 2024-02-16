
/**
 * 
 * @param {string} url 
 * @param {Object} options 
 * @returns {Promise}
 */
export async function apiFetch(url, options = {}) {
    const opts = {
        method: 'GET',
        headers: {
            "Accept": 'application/json'
        },
        credentials: 'include',
        ...options
    };
    const res = await fetch('https://localhost:8000'+url, opts);
    if(res.status === 204) { // 204 = résultat vide
        return null;
    }
    const data = await res.json();
    if(res.ok) {
        return data;
    } else {
        if(data.errors) {
            throw new ApiErrors(data.errors);
        }
    }
}



export class ApiErrors {
    constructor(errors) {
        this.errors = errors;
    }
}