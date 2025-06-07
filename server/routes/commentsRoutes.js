const express = require('express');
const router = express.Router();
const Controller = require('../controllers/commentsController');

router.get('/comments/:id', Controller.getRecipeComments);
router.post('/comments',async (req, res) => {
      console.log("BODY:", req.body);
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to comment" });
  }
Controller.postComments(req,res);
});
module.exports = router;
