const mongoose = require('mongoose');
const driverSchema = new mongoose.Schema({
    id_num: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    shiftHours: { type: Number, default: 0 },
    pastWeekHours: { type: Number, default: 0 },
    isFatigued: { type: Boolean, default: false },
});
module.exports = mongoose.model('Driver', driverSchema);