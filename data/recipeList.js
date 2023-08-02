const mongoose = require('mongoose')

const recipeListSchema = new mongoose.Schema({
    name: String,
    recipes: [{type: mongoose.Schema.Types.ObjectId, ref:'Recipe'}],
    owner: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
})

module.exports = mongoose.model('RecipeList', recipeListSchema)