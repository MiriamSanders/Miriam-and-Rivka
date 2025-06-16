const genericService = require('../services/genericService');
exports.getAllTags = async (req, res) => {
  try {
    const tags = await genericService.genericGetAll('tags');
    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Something went wrong while fetching tags' });
  }
}