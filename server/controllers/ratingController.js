const ratingsService =require( "../services/ratingsService");
exports.postRatings = async (userId, recipeId, rating ) => {
  if (!recipeId || !rating) {
    throw new Error('Recipe ID and rating are required');
  }
  try {
    await ratingsService.postRatings(recipeId, rating,userId);
    return { message: 'Rating added successfully' };
  } catch (error) {
    throw new Error('Something went wrong');
  }
}
exports.getRatings = async (recipeId) => {
    if (!recipeId) {
        throw new Error("Recipe ID is required");
    }
    try {
        const rating = await ratingsService.getRatings(recipeId);
        return { averageRating: rating };
    } catch (error) {
        throw new Error("Something went wrong while fetching ratings");
    }
}