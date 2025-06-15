import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/ArticlePage.css'; // Optional for styling
import ArticleDiscussion from './ArticleDiscussion';
import { useErrorMessage } from "./useErrorMessage";
import { getRequest } from '../Requests';
function ArticlePage() {
  const { id } = useParams();
  const [articleData, setArticleData] = useState(null);
  const [loading, setLoading] = useState(true);
 const [errorCode, setErrorCode] = useState(undefined);
  const errorMessage = useErrorMessage(errorCode);

  useEffect(() => {
    const fetchArticle = async () => {
        const requestResult = await getRequest(`articles/${id}`);
        if (!requestResult.succeeded){  setErrorCode(requestResult.status);}
          else{ setArticleData(requestResult.data);
        setErrorCode(undefined);}
        setLoading(false);
    };

    fetchArticle();
  }, [id]);

  if (loading) return <div className="article-loading">Loading article...</div>;
  if (!articleData) return <div>No article found.</div>;

  const { title, authorId, createdAt, content,authorName } = articleData;
  const formattedDate = new Date(createdAt).toLocaleDateString();

  return (
    <div className="article-container">
      {errorMessage && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          ⚠️ {errorMessage}
        </div>
      )}
      <h1 className="article-title">{title}</h1>
      <div className="article-meta">
        <span>By {authorName}</span>
        <span> | </span>
        <span>{formattedDate}</span>
      </div>
      <div className="article-content">
        {content.split('\n').map((paragraph, index) =>
          paragraph.trim() ? <p key={index}>{paragraph}</p> : <br key={index} />
        )}
      </div>
          <ArticleDiscussion articleId={id}/>
    </div>
  );
}

export default ArticlePage;
