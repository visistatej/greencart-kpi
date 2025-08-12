const mongoose = require('mongoose');
const routeSchema = new mongoose.Schema({
    id_num: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    distance: { type: Number, required: true },
    traffic: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
    baseTime: { type: Number, required: true },
});
module.exports = mongoose.model('Route', routeSchema);