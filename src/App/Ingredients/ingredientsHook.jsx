import { useCallback, useReducer } from "react"
import { apiFetch } from "../../helpers/api";

const ingredientsReducer = function(state, action) {
    switch(action.type) {
        case 'LOADING':
            return {
                ...state, 
                loading: true
            };
        case 'FETCH_INGREDIENTS': 
            return {
                ...state, 
                ingredients: action.payload,
                loading: false
            };
        case 'UPDATE_INGREDIENT':
            return {
                ...state,
                ingredients: state.ingredients.map(i => {
                    if(i === action.target) {
                        return action.payload;
                    }
                    return i;
                })
            };
        case 'CREATE_INGREDIENT':
            return {
                ...state,
                ingredients: [action.payload, ...state.ingredients]
            };
        case 'DELETE_INGREDIENT':
            return {
                ...state,
                ingredients: state.ingredients.filter(i => i !== action.payload)
            };
        default:
            return state;
    }
}

export const useIngredients = function() {
    const [state, dispatch] = useReducer(ingredientsReducer, {
        ingredients: null,
        loading: false
    });
    return {
        ingredients: state.ingredients,
        loading: state.loading,
        fetchIngredients: async () => {
            if(state.loading || state.ingredients) {
                return;
            }
            dispatch({type: 'LOADING'});
            const ingredients = await apiFetch('/ingredients');
            dispatch({type: 'FETCH_INGREDIENTS', payload: ingredients});
        },
        updateIngredient: useCallback(async (ingredient, data) => {
            const updatedIngredient = await apiFetch('/ingredients/update/'+ingredient.id, {
                method: 'POST',
                body: JSON.stringify(Object.fromEntries(data))
            });
            dispatch({type: 'UPDATE_INGREDIENT', payload: updatedIngredient, target: ingredient});
        }, []),
        createIngredient: useCallback(async (data) => {
            const newIngredient = await apiFetch('/ingredients', {
                method: 'POST',
                body: JSON.stringify(Object.fromEntries(data))
            });
            dispatch({type: 'CREATE_INGREDIENT', payload: newIngredient})
        }, []),
        deleteIngredient: useCallback(async (ingredient) => {
            await apiFetch('/ingredients/delete/'+ingredient.id, {
                method: 'POST'
            });
            dispatch({type: 'DELETE_INGREDIENT', payload: ingredient})
        }, [])
    };
}