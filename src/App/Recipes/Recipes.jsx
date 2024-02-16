import { createRef, memo, useEffect, useState } from "react";
import { Loader } from "../../ui/Loader/Loader";
import { Button } from "../../ui/Form/Button";
import { createPortal } from "react-dom";
import { Field, Option, Select, Textarea } from "../../ui/Form/Field";
import { Modal } from "../../ui/Modal";
import { TrashIcon } from "../../ui/Icons/Trash";
import { SaveIcon } from "../../ui/Icons/Save";
import { AddIcon } from "../../ui/Icons/Add";
import { useLoading } from "../../helpers/useLoading";
import { ApiErrors } from "../../helpers/api";
import { useToggle } from "../../helpers/useToggle";


export function Recipes({manager, ingredients}) {
    const [recipes, setRecipes] = useState(null);
    useEffect(() => {
        (async () => {
            await manager.fetchRecipes();
            setRecipes(manager.recipes);
        })();
    }, [manager, setRecipes]);

    return recipes === null ? <Loader />: <RecipesList recipes={recipes} manager={manager}  ingredients={ingredients} />
}

function RecipesList({recipes, manager, ingredients}) {
    return <div className="wrapper">
        { recipes.map(recipe => <RecipeCard key={recipe.id} 
                                            recipe={recipe} 
                                            fetchRecipe={manager.fetchRecipe}
                                            onDelete={manager.deleteRecipe} 
                                            onUpdate={manager.updateRecipe}
                                            onDeleteIngredientQuantity={manager.deleteIngredientQuantity} 
                                            onAddIngredientQuantity={manager.addIngredientQuantity}
                                            onUpdateIngredientQuantity={manager.updateIngredientQuantity}
                                            ingredients={ingredients} />) }
    </div>
}


const RecipeCard = memo(function RecipeCard({recipe, fetchRecipe, onDelete, onUpdate, ingredients, onDeleteIngredientQuantity, onAddIngredientQuantity, onUpdateIngredientQuantity}) {
    const [loading, setLoading] = useState(false);
    const [modalOpen, toggleModalOpening] = useToggle(false);
    
    const handleDelete = async function (e) {
        e.preventDefault();
        setLoading(true);
        await onDelete(recipe);
        setLoading(false);
    }

    const handleOpen = function (e) {
        e.preventDefault();
        toggleModalOpening();
        fetchRecipe(recipe);
    }

    return <div className="card">
        <h1 className="card-title">{recipe.title}</h1>
        <div className="card-controls">
            <Button loading={loading} className="btn btn-danger" onClick={handleDelete}>
                { !loading && <TrashIcon className="i-left" /> }
                <span>Supprimer</span>
            </Button>
            <Button className="btn btn-primary" onClick={handleOpen}>Modifier</Button>
        </div>
        { modalOpen && 
            createPortal(
                <Modal toggleOpening={toggleModalOpening}>
                    <RecipeUpdateCard   recipe={recipe} 
                                        ingredients={ingredients}
                                        onUpdate={onUpdate} 
                                        onDeleteIngredientQuantity={onDeleteIngredientQuantity}
                                        onAddIngredientQuantity={onAddIngredientQuantity}
                                        onUpdateIngredientQuantity={onUpdateIngredientQuantity}
                                        />
                </Modal>
                , document.body)
            }
    </div>
});



function RecipeUpdateCard({recipe, ingredients, onUpdate, onDeleteIngredientQuantity, onAddIngredientQuantity, onUpdateIngredientQuantity}) {
    const loading = useLoading();
    const [state, setState] = useState({
        title: recipe.title,
        description: recipe.description,
        errors: null
    });

    useEffect(() => {
        setState(state => ({
            ...state,
            description: recipe.description
        }));
    }, [recipe.description])

    const handleChange = function (e) {
        e.preventDefault();
        setState(state => ({
            ...state, 
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async function (e) {
        e.preventDefault();
        setState(state => ({
            ...state, 
            errors: null
        }));
        loading.start('UPDATE_RECIPE');
        try {
            await onUpdate(recipe, state);
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
        loading.stop();
    }

    const handleDeleteIngredientQuantity = async function (ingredientQuantity) {
        await onDeleteIngredientQuantity(recipe, ingredientQuantity);
    }

    const handleAddIngredientQuantity = async function (ingredientId, quantity) {
        await onAddIngredientQuantity(recipe, ingredientId, quantity);
    }

    const handleUpdateIngredientQuantity = async function (ingredientQuantity, quantity) {
        await onUpdateIngredientQuantity(recipe, ingredientQuantity, quantity);
    }


    return <>
        <Field name="title" value={state.title} onChange={handleChange} error={state.errors?.title} >Titre</Field> 
        
        <div>
            {
                recipe.ingredientsQuantity 
                ?
                recipe.ingredientsQuantity.map(
                ingredientQuantity => <IngredientQuantityUpdate key={ingredientQuantity.id} 
                                                                ingredientQuantity={ingredientQuantity} 
                                                                onDelete={handleDeleteIngredientQuantity}
                                                                onUpdate={handleUpdateIngredientQuantity}
                                                                loading={loading}
                                                                />
                )
                :
                <Loader />
            }
            <CreateIngredientQuantity ingredients={ingredients} onAdd={handleAddIngredientQuantity} loading={loading} />
        </div>
        {
            recipe.description 
            ?
            <Textarea name="description" value={state.description} onChange={handleChange}  error={state.errors?.description}>Description</Textarea>
            : 
            <Loader />
        }        
        <Button loading={loading.state && loading.target === 'UPDATE_RECIPE'} className="btn btn-success modal-update-button" onClick={handleSubmit}>
            { !loading && <SaveIcon className="i-left" /> }
            <span>Sauvegarder les modifications</span>
        </Button>
    </>
}


// function IngredientQuantity({ingredientQuantity}) {
//     return <li className="list-line">
//         <span>{ ingredientQuantity.ingredient.title } : </span>
//         <span>{ ingredientQuantity.quantity }</span>
//         <span>{ ingredientQuantity.ingredient.unit }</span>
//     </li>
// }

function IngredientQuantityUpdate({ingredientQuantity, onDelete, onUpdate, loading}) {
    const [quantity, setQuantity] = useState(ingredientQuantity.quantity.toString());
    const [quantityError, setQuantityError] = useState(null);

    useEffect(() => {
        setQuantity(ingredientQuantity.quantity.toString());
    }, [ingredientQuantity]);

    const handleQuantityChange = async function (e) {
        setQuantityError(null);
        e.preventDefault();
        setQuantity(e.currentTarget.value);
    };

    const handleDelete = async function (e) {
        e.preventDefault();
        setQuantityError(null);
        loading.start('DELETE_'+ingredientQuantity.id);
        try {
            await onDelete(ingredientQuantity);
        } catch(e) {
            throw e;
        }
        loading.stop();
    }

    const handleUpdate = async function (e) {
        e.preventDefault();
        setQuantityError(null);
        loading.start('UPDATE_'+ingredientQuantity.id);
        try {
            await onUpdate(ingredientQuantity, quantity);
        } catch(e) {
            if(e instanceof ApiErrors) {
                setQuantityError(e.errors?.quantity);
            } else {
                throw e;
            }
        }
        loading.stop();
    }

    
    return <li className="list-line">
        <span>{ ingredientQuantity.ingredient.title }</span>
        <Field name="quantity" type="number" onChange={handleQuantityChange} value={quantity} error={quantityError} />
        <span>{ ingredientQuantity.ingredient.unit }</span>
        <Button loading={loading.state && loading.target === 'UPDATE_'+ingredientQuantity.id} className="btn btn-primary" onClick={handleUpdate}>
            { (!loading.state || loading.target !== 'UPDATE_'+ingredientQuantity.id) &&  <SaveIcon /> }
        </Button>
        <Button loading={loading.state && loading.target === 'DELETE_'+ingredientQuantity.id} className="btn btn-danger" onClick={handleDelete}>
            { (!loading.state || loading.target !== 'DELETE_'+ingredientQuantity.id) &&  <TrashIcon /> }
        </Button>
    </li>
}
    
function CreateIngredientQuantity({ingredients, onAdd, loading}) {
    const [unit, setUnit] = useState(ingredients[0].unit);
    const [errors, setErrors] = useState(null);

    const handleChangeIngredient = function (e) {
        e.preventDefault();
        const currentIngredient = ingredients.find(i => i.id === parseInt(e.currentTarget.value));
        setUnit(currentIngredient.unit);
    }

    const handleSubmit = async function (e) {
        e.preventDefault();
        setErrors(null);
        loading.start('CREATE');
        const form = formRef.current;
        const data = new FormData(form);
        try {
            await onAdd(data.get('ingredient'), data.get('quantity'));
            form.reset();
        } catch(e) {
            if(e instanceof ApiErrors) {
                setErrors(e.errors);
            } else {
                throw e;
            }
        }
        loading.stop();
    };

    const formRef = createRef();

    return  <form onSubmit={handleSubmit} ref={formRef} className="form-line no-margin">
        <Select name="ingredient" defaultValue={ingredients[0].id} onChange={handleChangeIngredient}>
            { ingredients.map(ingredient => <Option key={ingredient.id} value={ingredient.id}>{ingredient.title}</Option>) }
        </Select>
        <Field type="number" name="quantity" placeholder="quantité" error={errors?.quantity}></Field> 
        <span>{ unit }</span>
        <Button loading={ loading.state && loading.target === 'CREATE' } type="submit" className="btn btn-primary" onClick={handleSubmit}>
            { (!loading.state || loading.target !== 'CREATE') &&  <AddIcon /> }
        </Button>
    </form>
}
