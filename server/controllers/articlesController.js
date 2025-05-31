const GenericDA = require('../services/GenericDA');

exports.getAllArticles = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const articles = await GenericDA.GenericGetAll('articles', limit, 0, ["ArticleID", "AuthorID","Title"]);
console.log(articles);

    if (!articles || articles.length === 0) {
      return res.json([]);
    }

    const authorIds = [...new Set(articles.map(article => article.AuthorID))];

const authors = await GenericDA.GenericGetIn('users', 'UserID', authorIds, ['UserID', 'UserName']);


const authorMap = {};
authors.forEach(author => {
  authorMap[author.UserID] = author.UserName;
});


    const enrichedArticles = articles.map(article => ({
      ...article,
      AuthorName: authorMap[article.AuthorID] || 'Unknown'
    }));
    res.json(enrichedArticles);
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
    const article = await GenericDA.GenericGet('articles', 'ArticleID', articleId, 1, 0);
    if (!article || article.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(article[0]);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'something went wrong' });
  }
};

