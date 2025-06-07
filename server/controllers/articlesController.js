const GenericDA = require('../services/GenericDA');
const articlesDA = require('../services/articlesDA');

exports.getAllArticles = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.page) || 0;

    const articles = await articlesDA.articleGetAll(limit, offset );
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
    const article = await articlesDA.getArticleById(articleId);
    if (!article || article.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'something went wrong' });
  }
};

