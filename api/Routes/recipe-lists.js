const router = require('express').Router()
const RecipeList = require('../../data/recipeList')

router.get('/:userId', async (req,res) => {
    try {
        const userId = req.params.userId
        const recipeLists = await RecipeList.find({owner:userId}).exec()
        res.set('Content-Type', 'application/json');
        res.json({recipeLists});
            
    } catch (e) {
        console.log(e)
        res.status(500)
    }
})