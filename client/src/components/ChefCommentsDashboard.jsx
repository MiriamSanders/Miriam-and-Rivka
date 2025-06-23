
import React, { useEffect, useState } from 'react';
import { getRequest, postRequest } from '../Requests';
import { useErrorMessage } from "./useErrorMessage";
import '../styles/ChefCommentsDashboard.css';

function ChefCommentsDashboard() {
  const [recipeComments, setRecipeComments] = useState([]);
  const [articleComments, setArticleComments] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [errorCode, setErrorCode] = useState(undefined);
  const [activeTab, setActiveTab] = useState('recipes'); // 'recipes' or 'articles'
  const errorMessage = useErrorMessage(errorCode);
  const [recipePage, setRecipePage] = useState(0);
  const [hasMoreRecipeComments, setHasMoreRecipeComments] = useState(true);

  const [articlePage, setArticlePage] = useState(0);
  const [hasMoreArticleComments, setHasMoreArticleComments] = useState(true);

  const limit = 10;
  const [isLoading, setIsLoading] = useState(false);
  const chefId = JSON.parse(localStorage.getItem("currentUser")).id;

  const fetchRecipeData = async () => {
    if (isLoading || !hasMoreRecipeComments) return;
    setIsLoading(true);
    const currentPage = recipePage;
    try {
      const requestResult = await getRequest(`recipecomments?chef=${chefId}&limit=${limit}&page=${currentPage}`);
      if (requestResult.succeeded) {
        const result = requestResult.data;
        const normalized = Array.isArray(result) ? result : result ? [result] : [];
        if (normalized.length < limit) setHasMoreRecipeComments(false);
        setRecipeComments(prev => [...prev, ...normalized]);
        setRecipePage(prev => prev + 1);
        setErrorCode(undefined);
      } else {
        setErrorCode(requestResult.status);
      }
    } catch (error) {
      console.error("Error fetching chef recipe comments:", error);
      setErrorCode(500);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRecipeData();
  }, []);

  const fetchArticleComments = async () => {
    if (isLoading || !hasMoreArticleComments) return;
    setIsLoading(true);
    
    try {
      const requestResult = await getRequest(`articlecomments?chef=${chefId}&limit=${limit}&page=${articlePage}`);
      if (requestResult.succeeded) {
        const result = requestResult.data;
        const normalized = Array.isArray(result) ? result : result ? [result] : [];
        if (normalized.length < limit) setHasMoreArticleComments(false);
        setArticleComments(prev => [...prev, ...normalized]);
        setArticlePage(prev => prev + 1);
        setErrorCode(undefined);
      } else {
        setErrorCode(requestResult.status);
      }
    } catch (error) {
      console.error("Error fetching chef article comments:", error);
      setErrorCode(500);
    }
    setIsLoading(false);
  };

  const handleRecipeCommentReply = async (commentId, recipeId) => {
    try {
      const requestResult = await postRequest(`recipecomments`, {
        recipeId: recipeId,
        parentCommentId: commentId,
        commentText: replyContent,
        userId: chefId
      });
      if (requestResult.succeeded) {
        setRecipeComments(prev =>
          prev.map(comment =>
            comment.commentId === commentId ? { ...comment, chefReplyText: replyContent } : comment
          )
        );
        setErrorCode(undefined);
      } else {
        setErrorCode(requestResult.status);
      }
    } catch (error) {
      console.error("Error replying to recipe comment:", error);
      setErrorCode(500);
    }
    setReplyingTo(null);
    setReplyContent('');
  };

  const handleArticleCommentReply = async (commentId, articleId) => {
    try {
      const requestResult = await postRequest(`articlecomments`, {
        articleId: articleId,
        parentCommentId: commentId,
        commentText: replyContent,
        userId: chefId
      });
      if (requestResult.succeeded) {
        setArticleComments(prev =>
          prev.map(comment =>
            comment.commentId === commentId ? { ...comment, chefReplyText: replyContent } : comment
          )
        );
        setErrorCode(undefined);
      } else {
        setErrorCode(requestResult.status);
      }
    } catch (error) {
      console.error("Error replying to article comment:", error);
      setErrorCode(500);
    }
    setReplyingTo(null);
    setReplyContent('');
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setReplyingTo(null);
    setReplyContent('');
    if (tab === 'recipes' && recipeComments.length === 0) {
      setRecipePage(0);
      setHasMoreRecipeComments(true);
      setRecipeComments([]);
      fetchRecipeData();
    } else if (tab === 'articles' && articleComments.length === 0) {
      setArticlePage(0);
      setHasMoreArticleComments(true);
      setArticleComments([]);
      fetchArticleComments();
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const bottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
      if (bottom) {
        if (activeTab === 'recipes') {
          fetchRecipeData();
        } else {
          fetchArticleComments();
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab, recipePage, articlePage, isLoading]);

  return (
    <div className="chef-dashboard-container">
      <div className="tab-buttons">
        <button 
          onClick={() => handleTabSwitch('recipes')} 
          disabled={activeTab === 'recipes'}
        >
          Comments on recipes
        </button>
        <button 
          onClick={() => handleTabSwitch('articles')} 
          disabled={activeTab === 'articles'}
        >
          Comments on articles
        </button>
      </div>

      {errorMessage && (
        <div className="error-message">
          ⚠️ {errorMessage}
        </div>
      )}

      {isLoading && (
        <div className="loading-message">
          Loading comments...
        </div>
      )}

      {activeTab === 'recipes' && (
        recipeComments.length === 0 ? (
          <div className="empty-state">
            No comments on recipes.
          </div>
        ) : (
          recipeComments.map(comment => (
            <div key={comment.commentId} className="comment-card">
              <div className="comment-header">
                Recipe: {comment.recipeTitle}
              </div>
              <div className="comment-content">
                <strong>{comment.userName}:</strong> {comment.commentText}
              </div>
              {comment.chefReplyText ? (
                <div className="chef-reply">
                  <strong>Your reply:</strong> {comment.chefReplyText}
                </div>
              ) : replyingTo === comment.commentId ? (
                <div className="reply-form">
                  <textarea
                    className="reply-textarea"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your reply..."
                  />
                  <div className="button-group">
                    <button 
                      className="btn" 
                      onClick={() => handleRecipeCommentReply(comment.commentId, comment.recipeId)}
                    >
                      Send Reply
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => setReplyingTo(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  className="btn btn-reply" 
                  onClick={() => setReplyingTo(comment.commentId)}
                >
                  Reply
                </button>
              )}
            </div>
          ))
        )
      )}

      {activeTab === 'articles' && (
        articleComments.length === 0 ? (
          <div className="empty-state">
            No comments on articles.
          </div>
        ) : (
          articleComments.map(comment => (
            <div key={comment.commentId} className="comment-card">
              <div className="comment-header">
                Article: {comment.articleTitle}
              </div>
              <div className="comment-content">
                <strong>{comment.userName}:</strong> {comment.commentText}
              </div>
              {comment.chefReplyText ? (
                <div className="chef-reply">
                  <strong>Your reply:</strong> {comment.chefReplyText}
                </div>
              ) : replyingTo === comment.commentId ? (
                <div className="reply-form">
                  <textarea
                    className="reply-textarea"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your reply..."
                  />
                  <div className="button-group">
                    <button 
                      className="btn" 
                      onClick={() => handleArticleCommentReply(comment.commentId, comment.articleId)}
                    >
                      Send Reply
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => setReplyingTo(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  className="btn btn-reply" 
                  onClick={() => setReplyingTo(comment.commentId)}
                >
                  Reply
                </button>
              )}
            </div>
          ))
        )
      )}
    </div>
  );
}

export default ChefCommentsDashboard;