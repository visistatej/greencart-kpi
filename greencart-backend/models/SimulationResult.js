const mongoose = require('mongoose');
const simulationResultSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    inputs: {
        numDrivers: Number,
        startTime: String,
        maxHours: Number,
    },
    kpis: {
        totalProfit: Number,
        efficiencyScore: Number,
        onTimeCount: Number,
        lateCount: Number,
        fuelCostBreakdown: [{ name: String, cost: Number }],
    },
});
module.exports = mongoose.model('SimulationResult', simulationResultSchema);