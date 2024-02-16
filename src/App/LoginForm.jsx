import { useCallback, useState } from "react";
import { apiFetch } from "../helpers/api";
import { Loader } from "../ui/Loader/Loader";

export function LoginForm({setUser}) {
    const [state, setState] = useState({
      username: '',
      password: '',
      errors: null,
      loading: false
    });
    
    const handleSubmit = useCallback(async (e) => {
      e.preventDefault();
      setState(state => ({
        ...state, 
        loading: true
      }))
      const data = new FormData(e.currentTarget);
      try {
        const user = await apiFetch('/login', {
          method: 'POST',
          body: JSON.stringify({
            username: data.get('username'),
            password: data.get('password')
          })
        });
        setUser(user);
      } catch(e) {
        setState(state => ({
          ...state,
          errors: e.errors,
          loading: false
        }));
      }
    }, [setUser]);
  
    const handleChange = useCallback((e) => {
        e.preventDefault();
        setState(state => ({
            ...state,
            [e.target.name]: e.target.value,
            error: null
        }));
    }, [setState]);
  
    return <div className="app">
      <nav className="login-navbar">
        <h1 className="login-navbar-item">Connexion</h1>
      </nav>
      <div className="container">
        <main className="main">
          {state.errors ? state.errors.map(errorMessage => <div className="alert alert-danger">{errorMessage}</div>): ''}
          <form onSubmit={handleSubmit}>
              <div className="form-group">
                  <label className="form-label" htmlFor="username">Nom d'utilisateur</label>
                  <input type="text" className="form-control" id="username" name="username" value={state.username} onChange={handleChange} />
              </div>
              <div className="form-group">
                  <label className="form-label" htmlFor="password">Mot de passe</label>
                  <input type="password" className="form-control" id="password" name="password" value={state.password} onChange={handleChange} />
              </div>
              <button type="submit" className="btn btn-primary">
                  { state.loading ? <Loader />: ''}
                  <span>Valider</span>
              </button>
          </form>
        </main>
      </div>
    </div>
  }