import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/ArticlePage.css'; // Optional for styling

function ArticlePage() {
  const { id } = useParams();
  const [articleData, setArticleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`http://localhost:3001/articles/${id}`);
        if (!response.ok) throw new Error("Failed to fetch article.");
        const data = await response.json();
        setArticleData(data);
      } catch (err) {
        console.error("Error loading article:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) return <div className="article-loading">Loading article...</div>;
  if (error) return <div className="article-error">Error: {error}</div>;
  if (!articleData) return <div>No article found.</div>;

  const { Title, AuthorID, CreatedAt, Content,AuthorName } = articleData;
  const formattedDate = new Date(CreatedAt).toLocaleDateString();

  return (
    <div className="article-container">
      <h1 className="article-title">{Title}</h1>
      <div className="article-meta">
        <span>By {AuthorName}</span>
        <span> | </span>
        <span>{formattedDate}</span>
      </div>
      <div className="article-content">
        {Content.split('\n').map((paragraph, index) =>
          paragraph.trim() ? <p key={index}>{paragraph}</p> : <br key={index} />
        )}
      </div>
    </div>
  );
}

export default ArticlePage;
