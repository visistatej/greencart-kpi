const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    id_num: { type: Number, required: true, unique: true },
    value: { type: Number, required: true },
    routeId: { type: Number, required: true },
});
module.exports = mongoose.model('Order', orderSchema);