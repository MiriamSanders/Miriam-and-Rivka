
const tagService=require('../services/tagService');
exports.getAllTags = async () => {
  try {
    const tags = await tagService.getAlltags();
    return tags;
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw new Error('Something went wrong while fetching tags');
  }
};