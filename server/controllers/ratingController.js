const ratingsService =require( "../services/ratingsService");
exports.postRatings = async (req, res) => {
  const { userId, recipeId, rating } = req.body;

  if (!recipeId || !rating) {
    return res.status(400).json({ error: 'Recipe ID and rating are required' });
  }

  try {
    await ratingsService.postRatings(recipeId, rating,userId);
    res.status(201).json({ message: 'Rating added successfully' });
  } catch (error) {
    console.error('Error adding rating:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
exports.getRatings = async (req, res) => {
      const { recipeId } = req.params;
    if (!recipeId) {
        return res.status(400).json({ error: "Recipe ID is required" });
    }
    try {
        const rating = await ratingsService.getRatings(recipeId);
        res.json({ averageRating: rating });
    } catch (error) {
        console.error("Error fetching ratings:", error);
        res.status(500).json({ error: "Something went wrong while fetching ratings" });
    }
}