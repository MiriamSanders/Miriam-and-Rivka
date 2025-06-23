const genericService = require('../services/genericService');
exports.getAllTags = async () => {
  try {
    const tags = await genericService.genericGetAll('tags');
    return tags;
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw new Error('Something went wrong while fetching tags');
  }
};