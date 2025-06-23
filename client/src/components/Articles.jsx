import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteRequest, getRequest } from '../Requests';
import '../styles/Articles.css';
import { useErrorMessage } from "./useErrorMessage";
import { Trash2 } from 'lucide-react';
function Articles() {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  const isAdmin = currentUser?.userType === "admin";
  const navigate = useNavigate();
  const limit = 9;
  const [errorCode, setErrorCode] = useState(undefined);
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
  const handleDeleteArticle = async (e, articleId) => {
    e.stopPropagation();
    const requestResult = await deleteRequest(`articles/${articleId}`);
    if (requestResult.succeeded) {
      setArticles(prev => prev.filter(c => c.articleId !== articleId));
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
    <div className="articles-container">
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
              {console.log(article.userId)}
              {(isAdmin || (currentUser && currentUser.id === article.authorId)) &&
                <button
                  onClick={(e) => handleDeleteArticle(e, article.articleId)}
                  style={{
                    color: "black",
                    marginLeft: "5px",
                    background:"transparent"
                  }}
                >
                  <Trash2 />
                </button>
              }
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
