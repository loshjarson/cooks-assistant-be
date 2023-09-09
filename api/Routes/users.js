const router = require('express').Router()
const User = require("../../data/user")
const Recipe = require("../../data/recipe");
const { default: mongoose } = require('mongoose');
const RecipeList = require('../../data/recipeList');
const GroceryList = require('../../data/groceryList');

//transform image into array buffer
const getFile = (filePath) => {
    const inputBuffer = fs.readFileSync(filePath);
    return inputBuffer
}

router.get('/', async (req,res) => {
    const users = await User.find({}).select({username:1}).lean();
    res.status(200).json(users)
})

router.put('/remove', async (req,res) => {
    try {
        const recipe = new mongoose.Types.ObjectId(req.body.recipeId)
        await User.findByIdAndUpdate(req.user,{$pull: {recipes:recipe}}).exec()
        await RecipeList.updateMany({owner:req.user,recipes:{$in: recipe}},{$pull:{recipes:recipe}})
        await GroceryList.findOneAndUpdate({owner:req.user},{$pull: {recipes:{recipe:req.body.recipId}}})

        res.status(201).json(recipe)
    } catch (e) {
        console.log(e)
        res.status(400).json({message:"error while adding recipe"})
    }
})

router.put('/add', async (req,res) => {
    try {
        const recipeId = new mongoose.Types.ObjectId(req.body.recipeId)
        await User.findByIdAndUpdate(req.user,{$push: {recipes:recipeId}}).exec()
        const recipe = await Recipe.findById(recipeId).lean()
        recipe.image = await getFile(recipe.image.key)
        await GroceryList.findOneAndUpdate({owner:req.user},{$addToSet: {recipes:{recipe:recipeId}}})

        res.status(201).json(recipe)  
    } catch (e) {
        console.log(e)
        res.status(400).json({message:"error while adding recipe"})
    }
    
})



module.exports = router