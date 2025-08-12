const express = require('express');
const Driver = require('../models/Driver');
const Route = require('../models/Route');
const Order = require('../models/Order');
const SimulationResult = require('../models/SimulationResult');
const router = express.Router();

router.get('/history', async (req, res) => {
    try {
        const history = await SimulationResult.find().sort({ timestamp: -1 }).limit(10);
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching history' });
    }
});

router.post('/run', async (req, res) => {
    const { numDrivers, startTime, maxHours } = req.body;
    if (!numDrivers || !startTime || !maxHours) {
        return res.status(400).json({ message: 'Missing required simulation inputs.' });
    }
    try {
        const allDrivers = await Driver.find();
        const allRoutes = await Route.find();
        const allOrders = await Order.find();
        
        let totalProfit = 0, onTimeCount = 0, lateCount = 0;
        const fuelCostBreakdown = {};
        const availableDrivers = allDrivers.slice(0, numDrivers);
        const ordersToProcess = allOrders.map(o => o.toObject());

        ordersToProcess.forEach((order, index) => {
            const driver = availableDrivers[index % availableDrivers.length];
            const route = allRoutes.find(r => r.id_num === order.routeId);
            if (!driver || !route) return;
            const deliverySpeedModifier = driver.isFatigued ? 1.30 : 1.0;
            const calculatedDeliveryTime = route.baseTime * deliverySpeedModifier;
            const isLate = calculatedDeliveryTime > (route.baseTime + 10);
            const penalty = isLate ? 50 : 0;
            if (isLate) lateCount++; else onTimeCount++;
            const bonus = (order.value > 1000 && !isLate) ? order.value * 0.10 : 0;
            let fuelCost = route.distance * 5;
            if (route.traffic === 'High') fuelCost += route.distance * 2;
            fuelCostBreakdown[route.name] = (fuelCostBreakdown[route.name] || 0) + fuelCost;
            totalProfit += (order.value + bonus - penalty - fuelCost);
        });

        const totalDeliveries = onTimeCount + lateCount;
        const efficiencyScore = totalDeliveries > 0 ? (onTimeCount / totalDeliveries) * 100 : 0;
        const kpis = { totalProfit, efficiencyScore, onTimeCount, lateCount, fuelCostBreakdown: Object.entries(fuelCostBreakdown).map(([name, cost]) => ({ name, cost })) };
        
        const newSimulation = new SimulationResult({ inputs: { numDrivers, startTime, maxHours }, kpis });
        await newSimulation.save();
        res.status(200).json({ kpis, message: 'Simulation completed successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'An error occurred during the simulation.' });
    }
});

module.exports = router;