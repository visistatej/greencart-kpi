const express = require('express');
const Order = require('../models/Order');
const router = express.Router();

router.get('/', async (req, res) => { 
    try { 
        res.json(await Order.find()); 
    } catch (err) { 
        res.status(500).json({ 
            message: err.message 
        });
    } 
});

router.post('/', async (req, res) => { 
    try { 
        const order = new Order(req.body);
        res.status(201).json(await order.save()); 
    } catch (err) { 
        res.status(400).json({ message: err.message }); 
    } 
});

router.put('/:id', async (req, res) => { 
    try { 
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedOrder); 
    } catch (err) { 
        res.status(400).json({ message: err.message }); 
    } 
});

router.delete('/:id', async (req, res) => { 
    try { 
        await Order.findByIdAndDelete(req.params.id); 
        res.json({ message: 'Deleted successfully' }); 
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    } 
});

module.exports = router;