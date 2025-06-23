const articlesService = require('../services/articlesService');
const genericService = require('../services/genericService');

exports.getAllArticles = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 0;
    const offset = page * limit - limit;

    const articles = await articlesService.articleGetAll(limit, offset);
    console.log(articles);

    if (!articles || articles.length === 0) {
      return res.json([]);
    }
    res.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'something went wrong' });
  }
};

exports.getArticleById = async (req, res) => {
  const articleId = parseInt(req.params.id);
  if (isNaN(articleId)) {
    return res.status(400).json({ error: 'Invalid article ID' });
  }

  try {
    const article = await articlesService.getArticleById(articleId);
    if (!article || article.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'something went wrong' });
  }
};

exports.postArticle = async (req, res) => {
  try {
    const data = req.body;
    const articleResult = await genericService.genericPost("articles", data, "articleId");
    res.status(201).json(articleResult);
  }
  catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};
exports.putArticle = async (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    const { title, content } = req.body;
    const articleResult = await articlesService.updateArticle(articleId, title, content);
    res.status(201).json(articleResult);
  }
  catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};
exports.deleteArticle = async (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    const result = await articlesService.deleteArticle(articleId);
    res.json(result);
  } catch (error) {
    console.error('Error delete article:', error);
    res.status(500).json({ error: 'somthing went wrong' });
  }
}