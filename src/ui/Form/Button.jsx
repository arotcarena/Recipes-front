import { Loader } from "../Loader/Loader";

export function Button({loading, className, type, onClick, children}) {
    return <button className={className + ' icon-left'} disabled={loading} type={type} onClick={onClick}>
        {loading ? <Loader className="i-left" />: ''}
        <span className="icon-left">{children}</span>
    </button>
}