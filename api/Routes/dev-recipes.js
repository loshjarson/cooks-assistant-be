const router = require('express').Router()
const multer = require('multer')
const Recipe = require("../../data/recipe")
const RecipeList = require("../../data/recipeList")
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

router.delete('/:id', async (req,res) => {
    try {
        const recipeId = req.params.id

        const recipe = await Recipe.findByIdAndDelete(recipeId).exec()

        if(recipe.image.key && recipe.image.key !== "48fbad0d3d3fcfaab90663eee7f477e2"){
            const recipeImage = await deleteFile(recipe.image.url)
            if(typeof recipeImage !== 'string'){
                res.status(400).json({message:"error while deleting image"})
            }
        }
        if(recipe != null){
            res.status(201).json({message:"Recipe deleted",recipe})
        } else {
            res.status(204).json({message:"No matching recipe found"})
        }     
    } catch (e) {  
        console.log(e.message)
        res.status(401)
    }
})

router.get('/:userId', async (req,res) => {
    try {
        const userId = req.params.userId
        const recipes = await Recipe.find({owner:userId}).exec()
        const recipeList = await RecipeList.find({owner:userId}).exec()
        for(const recipe in recipes){
            if(recipes[recipe].image.key){
                const recipeImage = await getFile(recipes[recipe].image.url)
                const updatedObj = {...recipes[recipe], image:recipeImage}
                recipes[recipe] = updatedObj
            }
        }
            res.set('Content-Type', 'application/json');
            res.status(200).json({recipes, recipeList});
            
    } catch (e) {
        console.log(e)
        res.status(500)
    }
})

const uploadImage = multer({dest:"uploads/"})

router.post('/:userId', uploadImage.single("image"), async (req,res) => {
    try {
        req.body.owner = req.params.userId
        req.body.ingredients = JSON.parse(req.body.ingredients)
        req.body.instructions = JSON.parse(req.body.instructions)
        req.body.tags = JSON.parse(req.body.tags)
        console.log(req.body)
        const recipe = new Recipe(req.body)
        console.log(req.file)
        
        if (req.file) {
            recipe.image = {url:req.file.path,key:req.file.filename};
        } else {
            recipe.image = {url:"uploads\\48fbad0d3d3fcfaab90663eee7f477e2",key:"48fbad0d3d3fcfaab90663eee7f477e2"};
        }
        let savedRecipe = await recipe.save(recipe)
        if(recipe.image && recipe.image.key){
            const recipeImage = await getFile(savedRecipe.image.url)
            console.log(recipeImage)
            savedRecipe = {...savedRecipe, image:recipeImage}
        }
    
        res.status(201).json({ recipe: savedRecipe });

    } catch (e) {
        console.log(e.message)
        res.status(204)
    }
})

router.post('/:recipeId/image', uploadImage.single('image'), (req, res) => {
    if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
    }
    const recipeId = req.params.recipeId;
    const imageId = req.file.id;

    Recipe.findByIdAndUpdate(
        recipeId,
        { image: imageId },
        { new: true },
        (err, recipe) => {
            if (err) {
                console.error('Error updating recipe:', err);
                return res.status(500).json({ message: 'Failed to update recipe' });
            }
            res.json({ recipe });
        }
    );
})


router.put('/:recipeId', uploadImage.single('image'), async (req,res) => {
    try {
        req.body.ingredients = JSON.parse(req.body.ingredients)
        req.body.instructions = JSON.parse(req.body.instructions)
        req.body.tags = JSON.parse(req.body.tags)
        const update = req.body;
        if(req.file){
            update.image = req.file.id
        }
        const recipe = await Recipe.findByIdAndUpdate(req.params.recipeId,update,{new:true})
        res.status(201).json({message:"Recipe updated successfully ", recipe})
    } catch (e) {
        console.log(e.message)
        res.status(401)
    }
    
})





module.exports = router