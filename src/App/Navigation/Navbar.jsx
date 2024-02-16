import { useCallback } from "react"

export function Navbar({routes, current, onClick, user, modalOpen, toggleModalOpening}) {
    const handleClick = function (e) {
        toggleModalOpening();
    }
    return <nav className="navbar">
        { routes.map(route => <NavItem key={route.name} route={route} active={route === current} onClick={onClick} />) }
        <button className={modalOpen ? 'active': ''} onClick={handleClick}>Ajouter une recette</button>
        { user ? <span className="navuser">Connecté en tant que <strong>{user.username}</strong></span>: ''}
    </nav>
}


function NavItem({route, active, onClick}) {
    const handleClick = useCallback((e) => {
        e.preventDefault();
        onClick(route);
    }, [onClick, route]);
    return <a href={route.href} className={'navitem'+ (active ? ' active': '')} onClick={handleClick}>{route.label}</a>
}
