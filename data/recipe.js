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
        id:Number,
        instruction:String
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

module.exports = mongoose.model('Recipe', recipeSchema)