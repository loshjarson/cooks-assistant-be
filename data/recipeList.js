const mongoose = require('mongoose')

const recipeListSchema = new mongoose.Schema({
    name: String,
    recipes: [{type: mongoose.Schema.Types.ObjectId, ref:'Recipe'}],
    owner: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
    updatedAt: { type: Date, default: () => Date.now() }
})

module.exports = mongoose.model('RecipeList', recipeListSchema)