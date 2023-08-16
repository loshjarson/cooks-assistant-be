const router = require('express').Router()
const multer = require('multer')
const Recipe = require("../../data/recipe")
const fs = require('fs')

//transform image into array buffer
const getFile = (filePath) => {
    const inputBuffer = fs.readFileSync(filePath);
    return inputBuffer
}

//remove image from local files
const deleteFile = (filePath) => {
    try{
        fs.unlinkSync(filePath);
        return "file deleted successfully"
    }
    catch(e){
        return e
    }

}

const uploadImage = multer({dest:"uploads/"})

router.get('/:userId', async (req,res) => {
    try {
        const userId = req.params.userId
        const recipes = await Recipe.find({owner:userId}).lean()
        //replace image url and key values in each recipe with input buffer of image
        recipes.map(async (recipe)=> {
            if(recipe.image.key){
                const recipeImage = await getFile(recipes[recipe].image.url)
                const updatedObj = {...recipe, image:recipeImage}
                return updatedObj
            } else return recipe
        })
            res.set('Content-Type', 'application/json');
            res.status(200).json(recipes);
            
    } catch (e) {
        console.log(e)
        res.status(500).json({message:"Error getting recipes"})
    }
})



router.post('/', uploadImage.single("image"), async (req,res) => {
    try {
        const recipe = req.body
        recipe.owner = req.user

        //parses arrays
        recipe.ingredients = JSON.parse(req.body.ingredients)
        recipe.instructions = JSON.parse(req.body.instructions)
        recipe.tags = JSON.parse(req.body.tags)
        
        //set recipe image field to local image props
        if (req.file) {
            recipe.image = {url:req.file.path,key:req.file.filename};
        } else {
            recipe.image = {url:"uploads\\48fbad0d3d3fcfaab90663eee7f477e2",key:"48fbad0d3d3fcfaab90663eee7f477e2"};
        }

        const newRecipe = await Recipe.create(recipe)

        //set image field to local file props
        if(newRecipe.image){
            const recipeImage = await getFile(newRecipe.image.url)
            newRecipe.image = recipeImage
        }
        res.status(201).json(newRecipe);

    } catch (e) {
        console.log(e.message)
        res.status(204).json({message:"Error creating recipe"})
    }
})

router.put('/:recipeId', uploadImage.single('image'), async (req,res) => {
    try {
        const updates = req.body;
        updates.ingredients = JSON.parse(updates.ingredients)
        updates.instructions = JSON.parse(updates.instructions)
        updates.tags = JSON.parse(updates.tags)
        
        const oldRecipe = await Recipe.findOne({_id:req.params.recipeId,owner:req.user})
        const updatedRecipe = await Recipe.findOneAndUpdate({_id:req.params.recipeId,owner:req.user},updates,{new:true})
        
        //if update includes a new image then delete the old one
        if(oldRecipe.image.key !== updatedRecipe.image.key) {
            await deleteFile(oldRecipe.image.url)
        }

        //replace image url and key values in each recipe with input buffer of image
        if(updatedRecipe.image){
            const recipeImage = await getFile(updatedRecipe.image.url)
            updatedRecipe.image = recipeImage
        }
        res.status(201).json(updatedRecipe)

    } catch (e) {
        console.log(e.message)
        res.status(401).json({message:"error while updating recipe"})
    }
    
})

router.delete('/:recipeId', async (req,res) => {
    try {
        const recipeId = req.params.recipeId

        const recipe = await Recipe.findOneAndDelete({_id:recipeId,owner:req.user}).lean()

        if(recipe.image.key && recipe.image.key !== "48fbad0d3d3fcfaab90663eee7f477e2"){
            await deleteFile(recipe.image.url)
            if(typeof recipeImage !== 'string'){
                res.status(400).json({message:"error while deleting image"})
            }
        }
        if(recipe != null){
            res.status(201).json(recipe)
        } else {
            res.status(204).json({message:"No matching recipe found"})
        }     
    } catch (e) {  
        console.log(e.message)
        res.status(401)
    }
})

module.exports = router