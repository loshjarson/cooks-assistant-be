const router = require('express').Router()
const Recipe = require("../../data/recipe")

router.get('/:userId', async (req,res) => {
    try {
        const recipes = await Recipe.find({owner:req.params.userId})
        res.status(201).json({message:"recipes gathered succesfully", recipes})
    } catch (e) {
        console.log(e.message)
        res.status(400)
    }
})

router.get('/:userId/:recipeId', (req,res) => {
    
})

router.post('/', async (req,res) => {
    try {
        const recipe = await Recipe.create(req.body)
        res.status(201).json({message:"recipe succesfully saved", recipe})
    } catch (e) {
        console.log(e.message)
        res.status(401)
    }
})

router.patch('/:recipeId', async (req,res) => {
    try {
        const recipe = await Recipe.findByIdAndUpdate(req.params.recipeId,req.body,{new:true})
        res.status(201).json({message:"recipe succesfully updated", recipe})
    } catch (e) {
        console.log(e.message)
        res.status(401)
    }
    
})

router.delete('/:recipeId', (req,res) => {

})



module.exports = router