const express = require('express');
const Driver = require('../models/Driver');
const router = express.Router();

router.get('/', async (req, res) => { 
    try { 
        res.json(await Driver.find());
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    } 
});

router.post('/', async (req, res) => { 
    try { 
        res.status(201).json(await new Driver(req.body).save()); 
    } catch (err) { 
        res.status(400).json({ message: err.message }); 
    } 
});

router.put('/:id', async (req, res) => { 
    try { 
        res.json(await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true })); 
    } catch (err) { 
        res.status(400).json({ message: err.message }); 
    } 
});

router.delete('/:id', async (req, res) => { 
    try { 
        await Driver.findByIdAndDelete(req.params.id); 
        res.json({ message: 'Deleted successfully' }); 
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    } 
});

module.exports = router;