const mongoose = require('mongoose')

const weeklyListSchema = new mongoose.Schema({
    recipes: {type: mongoose.Schema.Types.ObjectId, ref:'Recipe'},
    owner: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
    updatedAt: { type: Date, default: () => Date.now() }
})

module.exports = mongoose.model('WeeklyRecipe', weeklyListSchema)