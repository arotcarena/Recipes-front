import PropTypes from 'prop-types';

export function Field({children, name, type = 'text', error, ...props}) {
    return <div className="form-group">
        { children && <label className="form-label" htmlFor={name}>{children}</label>}
        <input type={type} name={name} {...props} className={`form-control${error ? ' is-invalid': ''}`} />
        { error && <div className="form-error">{error}</div> }
    </div>
}


Field.propTypes = {
    name: PropTypes.string,
    type: PropTypes.string,
    error: PropTypes.string,
    childre: PropTypes.node
}





export function Select({children, name, ...props}) {
    return <select className="form-control" name={name} {...props}>
        {children}
    </select>
}

export function Option({children, value}) {
    return <option value={value}>{children}</option>
}



export function Textarea({children, name, error, ...props}) {
    return <div className="form-group">
        { children && <label className="form-label" htmlFor={name}>{children}</label> }
        <textarea className={`form-control textarea-control${error ? ' is-invalid': ''}`} rows={props.row ?? '5'} name={name} {...props} id={name} />
        { error && <div className="form-error">{error}</div> }
    </div>
}