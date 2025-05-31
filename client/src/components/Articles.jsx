import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRequest } from '../Requests';
import '../styles/Articles.css';

function Articles() {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1); 
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const limit = 6;

  const getArticles = async () => {
    const requestResult = await getRequest(`articles?limit=${limit}&offset=${page}`);
    if (requestResult.succeeded) {
      const newArticles = requestResult.data;
      if (newArticles.length < limit) {
        setHasMore(false);
      }
      setArticles((prev) => [...prev, ...newArticles]); 
    } else {
      console.log(requestResult.error);
    }
  };

  useEffect(() => {
    getArticles();
  }, [page]);

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };
const openArticle = (e) => {
  const articleId = e.currentTarget.getAttribute('data-article-id');
  if (articleId) {
    navigate(`/articles/${articleId}`);
  } else {
    console.error('Article ID not found');
  }

}
  return (
    <div className="articlesrecipes-container">
      <h1>Articles</h1>

      <div className="articles-list">
        {articles.length === 0 ? (
          <p className="no-articles">No articles found available</p>
        ) : (
          articles.map((article) => (
            <div key={article.ArticleID} className="article-card" data-article-id={article.ArticleID} onClick={openArticle}>
                <div className="article-overlay">
                  <h2>{article.Title}</h2>
                  <p>Written by:{article. AuthorName}</p>
                </div>
              </div>
          ))
        )}
      </div>

      {hasMore && articles.length > 0 && (
        <button onClick={loadMore} className="load-more-button">
          load more
        </button>
      )}
    </div>
  );
}

export default Articles;
