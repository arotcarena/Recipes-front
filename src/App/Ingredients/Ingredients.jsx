import { memo, useEffect, useState } from "react";
import { ApiErrors } from "../../helpers/api";
import { Field } from "../../ui/Form/Field";
import { Loader } from "../../ui/Loader/Loader";
import { Button } from "../../ui/Form/Button";

export function Ingredients({manager}) {
    useEffect(() => {
        manager.fetchIngredients();
        // eslint-disable-next-line
    }, []);


    return manager.ingredients ? <IngredientsList manager={manager} />: <Loader />
}


function IngredientsList({manager}) {
    const {
        ingredients,
        updateIngredient,
        createIngredient,
        deleteIngredient
    } = manager;
    return <div className="list">
        <div className="list-line">
            <CreateIngredient createIngredient={createIngredient} />
        </div>
        {ingredients.map(ingredient => <Ingredient key={ingredient.id} ingredient={ingredient} updateIngredient={updateIngredient} deleteIngredient={deleteIngredient} />)}
    </div>
}

function CreateIngredient({createIngredient}) {
    const [state, setState] = useState({
        loading: false,
        errors: null
    });
    const handleSubmit = async function (e) {
        e.preventDefault();
        setState({
            loading: true,
            errors: null
        });
        const form = e.target;
        const data = new FormData(form);
        try {
            await createIngredient(data);
            form.reset();
        } catch(e) {
            if(e instanceof ApiErrors) {
                setState(state => ({
                    ...state,
                    errors: e.errors
                }));
            } else {
                throw e;
            }
        }
        setState(state => ({
            ...state,
            loading: false
        }));
    };

    return <form className="form-line" onSubmit={handleSubmit}>
        <Field placeholder="Nom de l'ingrédient" name="title" error={state.errors?.title} />
        <Field placeholder="Unité" name="unit" error={state.errors?.unit} />
        <Button className="btn btn-success" type="submit" loading={state.loading}>Ajouter</Button>
    </form>
}



const Ingredient = memo(({ingredient, updateIngredient, deleteIngredient}) => {
    const [state, setState] = useState({
        loading: false,
        deleting: false,
        errors: null
    });
    const handleSubmit = async function (e) {
        e.preventDefault();
        setState(state => ({
            ...state,
            loading: true,
            errors: null
        }));
        const data = new FormData(e.currentTarget);
        try {
            await updateIngredient(ingredient, data);
        } catch(e) {
            if(e instanceof ApiErrors) {
                setState(state => ({
                    ...state,
                    errors: e.errors
                }));
            } else {
                throw e;
            }
        }
        setState(state => ({
            ...state,
            loading: false
        }));
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        setState(state => ({
            ...state,
            deleting: true,
            errors: null
        }));
        try {
            await deleteIngredient(ingredient);
        } catch(e) {
            if(e instanceof ApiErrors) {
                setState(state => ({
                    ...state,
                    errors: e.errors
                }));
            } else {
                throw e;
            }
        }
        setState(state => ({
            ...state, 
            deleting: false
        }));
    };

    return <>
        <div className="list-line">
            <form className="form-line" onSubmit={handleSubmit}>
                <Field name="title" defaultValue={ingredient.title} error={state.errors?.title} />
                <Field name="unit" defaultValue={ingredient.unit} error={state.errors?.unit} />
                <Button className="btn btn-primary" type="submit" loading={state.loading}>Modifier</Button>
            </form>
            <Button className="btn btn-danger" loading={state.deleting} onClick={handleDelete}>Supprimer</Button>
        </div>
    </>
});




