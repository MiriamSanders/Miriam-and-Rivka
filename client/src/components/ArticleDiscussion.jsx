import React, { useRef, useEffect, useState } from "react";
import { useErrorMessage } from "./useErrorMessage";
import { deleteRequest, postRequest, getRequest } from "../Requests"; // הוספתי גם getRequest שהיה חסר
import { Trash2 } from "lucide-react";

const ArticleDiscussion = ({ articleId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  const isAdmin = currentUser?.userType === "admin";
  const [errorCode, setErrorCode] = useState(undefined);
  const errorMessage = useErrorMessage(errorCode);
  const commentsRef = useRef(null);
  const loadMoreRef = useRef(null);
  const hasStarted = useRef(false);

  const fetchComments = async (pageNum) => {
    if (loading) return;
    setLoading(true);
    const requestResult = await getRequest(`articlecomments/${articleId}?page=${pageNum}&limit=5`);
    if (requestResult.succeeded) {
      if (requestResult.data && requestResult.data.length > 0) {
        setComments((prev) => [...prev, ...requestResult.data]);
        setHasMore(requestResult.data.length === 5);
        setPage((prev) => prev + 1);
        setErrorCode(undefined);
      } else {
        setHasMore(false);
        setErrorCode(undefined);
      }
    } else {
      setErrorCode(requestResult.status);
    }
    setLoading(false);
    setCommentsLoaded(true);
  };

  const handleAddComment = async () => {
    if (newComment.trim() === "") return;
    if (currentUser) {
      const requestResult = await postRequest(`articlecomments`, {
        commentText: newComment,
        userId: currentUser.id,
        articleId: articleId
      });

      if (requestResult.succeeded) {
        setComments([...comments, {
          commentId: requestResult.data,
          commentText: newComment,
          userName: currentUser.userName
        }]);
        setErrorCode(undefined);
      } else {
        setErrorCode(requestResult.status);
      }
      setNewComment("");
    }
  };
  const handleDeleteComment = async (commentId) => {
    const requestResult = await deleteRequest(`articlecomments/${commentId}`);
    if (requestResult.succeeded) {
      setComments(prev => prev.filter(c => c.commentId !== commentId));
      setErrorCode(undefined);
    } else {
      setErrorCode(requestResult.status);
    }
  };
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          fetchComments(1);
        }
      },
      { threshold: 0.1 }
    );

    if (commentsRef.current) {
      observer.observe(commentsRef.current);
    }

    return () => {
      if (commentsRef.current) {
        observer.unobserve(commentsRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && commentsLoaded && !loading) {
          fetchComments(page);
        }
      },
      { threshold: 1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [commentsLoaded, page, hasMore, loading]);

  return (
    <div className="discussion-container">
      <h2 className="section-title">Questions & Responses</h2>

      {errorMessage && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          ⚠️ {errorMessage}
        </div>
      )}

      <div ref={commentsRef} className="comments-list">
        {comments.map((comment) => (
          <div key={comment.commentId} className="comment">
            <strong>{comment.userName}:</strong> <span>{comment.commentText}</span>
            {console.log(comment.userId)}
            {(isAdmin || (currentUser && currentUser.id === comment.userId)) &&
              <button
                onClick={() => handleDeleteComment(comment.commentId)}
                style={{
                  color: "black",
                  marginLeft: "5px",
                  background: 'transparent'
                }}
              >
                <Trash2 />
              </button>
            }
                {comment.chefReplyText && (
              <div className="ml-4 p-2 bg-gray-100 border-l-4 border-green-500 rounded">
                <strong>Chef's answer:</strong> <span>{comment.chefReplyText}</span>
              </div>
            )}
          </div>
        ))}

        {!hasMore && comments.length > 0 && (
          <div style={{ textAlign: "center", marginTop: "1rem", color: "#666" }}>
            You have reached the end
          </div>
        )}

        {hasMore && (
          <div ref={loadMoreRef} style={{ height: "1px" }}></div>
        )}

        {loading && <p style={{ textAlign: "center" }}>Loading more comments...</p>}
      </div>

      <div className="comment-input-container">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="comment-input"
        />
        <button onClick={handleAddComment} className="comment-button">
          Post
        </button>
      </div>
    </div>
  );
};

export default ArticleDiscussion;



