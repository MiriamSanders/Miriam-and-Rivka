import React, { useRef, useEffect, useState } from "react";
import { useErrorMessage } from "./useErrorMessage";

const ArticleDiscussion = ({ articleId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorCode, setErrorCode] = useState<number | undefined>(undefined);
  const errorMessage = useErrorMessage(errorCode);
  const commentsRef = useRef(null);
  const loadMoreRef = useRef(null);
  const hasStarted = useRef(false);

  const fetchComments = async (pageNum) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/articlecomments/${articleId}?page=${pageNum}&limit=5`);
      if (!response.ok) {
        setErrorCode(response.status);
        return;
      }

      const data = await response.json();
      if (data && data.length > 0) {
        setComments((prev) => [...prev, ...data]);
        setHasMore(data.length === 5);
        setPage((prev) => prev + 1);
        setErrorCode(undefined);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setErrorCode(500);
    } finally {
      setLoading(false);
      setCommentsLoaded(true);
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim() === "") return;

    const currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
    if (currentUser) {
      try {
        const response = await fetch(`http://localhost:3001/articlecomments`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            commentText: newComment,
            userId: currentUser.id,
            articleId: articleId
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setComments([...comments, {
            commentId: data,
            commentText: newComment,
            userName: currentUser.userName
          }]);
          setErrorCode(undefined);
        } else {
          setErrorCode(response.status);
        }
      } catch (err) {
        setErrorCode(500);
        console.error("Error add comments:", err);
      } finally {
        setNewComment("");
      }
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


