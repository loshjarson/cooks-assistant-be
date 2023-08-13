const router = require('express').Router()
const RecipeList = require("../../data/recipeList")

router.post('/', async (req,res) => {
    try {
        const userId = req.user
        if (Object.keys(req.body).length !== 0){
            const recipeList = JSON.parse(req.body)
            const list = new RecipeList({recipes:recipeList, owner:userId})
        } else {
            const list = new RecipeList({recipes:[], owner:userId})
        }

        let savedList = await list.save() 
        res.status(201).json({savedList})

    } catch (e) {
        console.log(e.message)
        res.status(401)
    }
})

router.get('/:userId', async (req,res) => {
    try {
        const userId = req.params.userId
        const recipeLists = await RecipeList.find({owner:userId}).exec()

        res.status(200).json({recipeLists})

    } catch (e) {
        console.log(e.message)
        res.status(401)
    }
})

router.put('/:recipeListId', async (req, res)=> {
    try {
        const listId = req.params.recipeListId
        req.body.recipes = JSON.parse(req.body.recipes)

        const updatedList = await RecipeList.findByIdAndUpdate(listId, req.body,{new:true})

        if(updatedList !== null){
            res.status(201).json({updatedList})
        } else {
            res.status(204)
        }
    } catch (e) {
        console.log(e.message)
        res.status(401)
    }
})

router.delete("/:recipeListId", async (req, res) => {
    try {
        const listId = req.params.recipeListId
        const deletedList = await RecipeList.findByIdAndDelete(listId).exec()

        if(deletedList != null){
            res.status(201).json({message:"Recipe deleted",deletedList})
        } else {
            res.status(204).json({message:"No matching recipe found"})
        }  
    } catch (e) {
        console.log(e.message)
        res.status(401)
    }
})

module.exports = router