const mongoose = require('mongoose')

const recipeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    ingredients: [{
        name: String,
        amount: Number,
        unit: String
    }],
    instructions: {
        type:Object
    },
    prepTime: Number,
    cookTime: Number,
    totalTime: Number,
    servings: Number,
    owner: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
    tags: [String],
    image: {url:String, key:String},
    createdAt: { type: Date, default: () => Date.now(), immutable:true },
    updatedAt: { type: Date, default: () => Date.now() }
})

// middleware to remove references from recipe lists
recipeSchema.pre('delete', async function(next) {
    try {
        // 'this' refers to the recipe being deleted

        // find all recipe lists that reference this recipe
        const RecipeList = mongoose.model('RecipeList');
        const lists = await RecipeList.find({ recipes: this._id });

        // Loop through the lists and remove the reference to the deleted recipe
        for (const list of lists) {
            list.recipes.pull(this._id);
            await list.save();
        }

        // Proceed with the recipe deletion
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Recipe', recipeSchema)