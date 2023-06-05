const router = require('express').Router()
const Recipe = require("../../data/recipe")
const {uploadImage} = require('../middleware/middleware')

router.get('/:userId', (req,res) => {
    try {
        const userId = req.params.userId
        Recipe.find({owner:userId})
            .populate('image')
            .exec((err, recipes) => {
                if (err) {
                  console.error('Error retrieving recipes:', err);
                  return res.status(500).json({ message: 'Failed to retrieve recipes' });
                }
          
                res.json({ recipes });
            });
    } catch (e) {
        console.log(e.message)
        res.status(500)
    }
})

router.post('/', uploadImage.single('image'), async (req,res) => {
    try {
        const recipe = new Recipe(req.body)
        if (req.file) {
            recipe.image = req.file.id;
        }
        recipe.save((err, savedRecipe) => {
        if (err) {
            console.error('Error saving recipe:', err);
            return res.status(500).json({ message: 'Failed to save recipe' });
        }
    
        res.json({ recipe: savedRecipe });
        });

    } catch (e) {
        console.log(e.message)
        res.status(401)
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

router.patch('/:recipeId', uploadImage.single('image'), async (req,res) => {
    try {
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

router.delete('/:recipeId', (req,res) => {

})



module.exports = router