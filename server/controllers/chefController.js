const chefService = require('../services/chefService');

exports.getAllChefs = async (req, res) => { 
    const result = await chefService.getAllChefs();
    if (result) {
        res.status(200).json(result);
    } else {
        res.status(500).json({ error: 'Failed to retrieve chefs' });
    }
}