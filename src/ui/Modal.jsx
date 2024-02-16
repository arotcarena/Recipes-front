import { useState } from "react";
import { CloseIcon } from "./Icons/Close";

export function Modal({toggleOpening, children}) {
    const [closing, setClosing] = useState(false);

    const handleClose = function (e) {
        e.preventDefault();
        setClosing(true);
        document.querySelector('.modal-bg').addEventListener('animationend', function (e) {
            toggleOpening();
        })
    }

    const stopPropagation = function (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    return <div className={'modal-bg' + (closing ? ' closing': '')} onClick={handleClose}>
        <div className="modal-wrapper" onClick={stopPropagation}>
            {children}
            <div className="modal-closer" onClick={handleClose}><CloseIcon /></div>
        </div>
    </div>
}