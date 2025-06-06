import React, { useRef, useEffect, useState } from "react";

const RecipeDiscussion = ({ recipeId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const commentsRef = useRef(null);
  const loadMoreRef = useRef(null);
  const hasStarted = useRef(false);

  const fetchComments = async (pageNum) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/comments/${recipeId}?page=${pageNum}&limit=5`);
      const data = await response.json();
      if (data && data.length > 0) {
        setComments((prev) => [...prev, ...data]);
        setHasMore(data.length === 5);
        setPage((prev) => prev + 1);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading comments:", err);
    } finally {
      setLoading(false);
      setCommentsLoaded(true);
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

  const handleAddComment = async () => {
    if (newComment.trim() === "") return;
    const currentUser = localStorage.getItem("CurrentUser")
    if (currentUser) {
      try {
        const response = await fetch(`http://localhost:3001/comments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            CommentText: newComment,
            UserID: currentUser.id,
            RecipeID: recipeId
          }),
        });
        const data = await response.json();
        setComments([...comments, {
          CommentID: data.CommentID, CommentText: newComment,
          UserName: currentUser.UserName
        }]);
      } catch (err) {
        console.error("Error loading comments:", err);
      } finally {
        setNewComment("");
      }
    }
  };

  return (
    <div className="discussion-container">
      <h2 className="section-title">Questions & Responses</h2>

      <div ref={commentsRef} className="comments-list">
        {comments.map((comment) => (
          <div key={comment.CommentID} className="comment">
            <strong>{comment.UserName}:</strong> <span>{comment.CommentText}</span>
          </div>
        ))}

        {"You have reached the end"}
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

export default RecipeDiscussion;

