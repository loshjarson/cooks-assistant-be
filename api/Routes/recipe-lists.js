const router = require('express').Router()
const RecipeList = require("../../data/recipeList")

router.post('/:userId', async (req,res) => {
    try {
        const recipeList = JSON.parse(req.body)
        const userId = req.params.userId

        const list = new RecipeList({recipes:recipeList, owner:userId})

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
        const recipeLists = RecipeList.find({owner:userId}).exec()

        res.status(200).json({recipeLists})

    } catch (e) {
        console.log(e.message)
        res.status(401)
    }
})

module.exports = router