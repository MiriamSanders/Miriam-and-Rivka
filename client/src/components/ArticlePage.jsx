import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/ArticlePage.css';
import ArticleDiscussion from './ArticleDiscussion';
import { useErrorMessage } from "./useErrorMessage";
import { getRequest, putRequest } from '../Requests';
import { Edit, X } from 'lucide-react';

function ArticlePage() {
  const { id } = useParams();
  const [articleData, setArticleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorCode, setErrorCode] = useState(undefined);
  const errorMessage = useErrorMessage(errorCode);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");

  useEffect(() => {
    const fetchArticle = async () => {
      const requestResult = await getRequest(`articles/${id}`);
      if (!requestResult.succeeded) {
        setErrorCode(requestResult.status);
      } else {
        setArticleData(requestResult.data);
        setEditedTitle(requestResult.data.title);
        setEditedContent(requestResult.data.content);
        setErrorCode(undefined);
      }
      setLoading(false);
    };

    fetchArticle();
  }, [id]);

  if (loading) return <div className="article-loading">Loading article...</div>;
  if (!articleData) return <div>No article found.</div>;

  const { title, authorId, createdAt, content, authorName } = articleData;
  const formattedDate = new Date(createdAt).toLocaleDateString();
  const canEditOrDelete =
    currentUser &&
    (currentUser.userType === "admin" || currentUser.id === authorId);

  const handleSave = async () => {
    const updatedArticle = {
      title: editedTitle,
      content: editedContent
    };
    const response = await putRequest(`articles/${id}`, updatedArticle);
    if (response.succeeded) {
      setArticleData({ ...articleData, ...updatedArticle });
      setIsEditing(false);
    } else {
      setErrorCode(response.status);
    }
  };

  return (
    <div className="article-container">
      {errorMessage && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          ⚠️ {errorMessage}
        </div>
      )}
      {console.log(articleData)}
      {canEditOrDelete && (
        <div className="article-edit-controls">
          {isEditing ? (
            <>
              <button onClick={handleSave} className='edit-save-button'>Save Changes</button>
              <button onClick={() => setIsEditing(false)} className='edit-cancel-button'>Cancel</button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className='edit-button'><Edit /></button>
          )}
        </div>
      )}
      {isEditing ? (
        <input
          className="article-title-input"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
        />
      ) : (
        <h1 className="article-title">{title}</h1>
      )}

      <div className="article-meta">
        <span>By {authorName}</span>
        <span> | </span>
        <span>{formattedDate}</span>
      </div>

      <div className="article-content">
        {isEditing ? (
          <textarea
            className="article-content-textarea"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={10}
          />
        ) : (
          content.split('\n').map((paragraph, index) =>
            paragraph.trim() ? <p key={index}>{paragraph}</p> : <br key={index} />
          )
        )}
      </div>



      <ArticleDiscussion articleId={id} />
    </div>
  );
}

export default ArticlePage;

