import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRequest } from '../Requests';
import '../styles/Articles.css';
import { useErrorMessage } from "./useErrorMessage";
function Articles() {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const limit = 6;
    const [errorCode, setErrorCode] = useState<number | undefined>(undefined);
  const errorMessage = useErrorMessage(errorCode);

  const getArticles = async () => {
    const requestResult = await getRequest(`articles?limit=${limit}&page=${page}`);
    if (requestResult.succeeded) {
      const newArticles = requestResult.data;
      if (newArticles.length < limit) {
        setHasMore(false);
      }
      setArticles((prev) => [...prev, ...newArticles]); 
        setErrorCode(undefined);
    } else {
       setErrorCode(requestResult.status);
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
 {errorMessage && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          ⚠️ {errorMessage}
        </div>
      )}
      <div className="articles-list">
        {articles.length === 0 ? (
          <p className="no-articles">No articles found available</p>
        ) : (
          articles.map((article) => (
            <div key={article.articleId} className="article-card" data-article-id={article.articleId} onClick={openArticle}>
                <div className="article-overlay">
                  <h2>{article.title}</h2>
                  <p>Written by:{article.userName}</p>
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
