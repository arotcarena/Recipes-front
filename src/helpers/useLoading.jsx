import { useReducer } from "react";


const loadingReducer = function (state, action) {
    switch(action.type) {
        case 'START_LOADING':
            return {
                loading: true,
                target: action.payload
            };
        case 'STOP_LOADING':
            return {
                loading: false,
                target: null
            };
        default: 
            throw new Error('dans loadingReducer : ACTION INCONNUE')
    }
};


export function useLoading() {
    const [state, dispatch] = useReducer(loadingReducer, {
        loading: false,
        target: null
    });

    return {
        state: state.loading,
        target: state.target,
        start: function (target) {
            dispatch({type: 'START_LOADING', payload: target});
        },
        stop: function () {
            dispatch({type: 'STOP_LOADING'});
        }
    }
}