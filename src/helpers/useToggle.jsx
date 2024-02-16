import { useCallback, useState } from "react"


export const useToggle = function (initial) {
    const [state, setState] = useState(initial);
    const toggle = useCallback(() => {
        setState(state => !state);
    }, []);
    return [state, toggle];
}
