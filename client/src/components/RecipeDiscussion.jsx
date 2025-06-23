import React, { useRef, useEffect, useState } from "react";
import "../styles/RecipeDiscussion.css"; // Assuming you have a CSS file for styling
import { deleteRequest, getRequest, postRequest } from "../js_files/Requests";
import { useErrorMessage } from "./useErrorMessage";
import { Trash2 } from "lucide-react";
const RecipeDiscussion = ({ recipeId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  const isAdmin = currentUser?.userType === "admin";
  const commentsRef = useRef(null);
  const loadMoreRef = useRef(null);
  const hasStarted = useRef(false);
  const [errorCode, setErrorCode] = useState(undefined);
  const errorMessage = useErrorMessage(errorCode);
  const fetchComments = async (pageNum) => {
    if (loading) return;
    setLoading(true);
    const requestResult = await getRequest(`recipecomments?recipe=${recipeId}&page=${page}&limit=5`);
    if (requestResult.succeeded) {
      if (requestResult.data && requestResult.data.length > 0) {
        setComments((prev) => [...prev, ...requestResult.data]);
        setHasMore(requestResult.data.length === 5);
        setPage((prev) => prev + 1);
      } else {
        setHasMore(false);
      }
      setErrorCode(undefined);
    }
    else {
      setErrorCode(requestResult.status);
    }
    setLoading(false);
    setCommentsLoaded(true);
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
  const handleDeleteComment = async (commentId) => {
    const requestResult = await deleteRequest(`recipecomments/${commentId}`);
    if (requestResult.succeeded) {
      setComments(prev => prev.filter(c => c.commentId !== commentId));
      setErrorCode(undefined);
    } else {
      setErrorCode(requestResult.status);
    }
  };
  const handleAddComment = async () => {
    if (newComment.trim() === "") return;
    if (currentUser) {
      const requestResult = await postRequest(`recipecomments`, {
        commentText: newComment,
        userId: currentUser.id,
        recipeId: recipeId
      });
      if (requestResult.succeeded) {
        setComments([...comments, {
          commentId: requestResult.data, commentText: newComment,
          userName: currentUser.userName
        }])
        setErrorCode(undefined);
      }
      else {
        setErrorCode(requestResult.status);
      }
      setNewComment("");
    };
  };
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
          <div key={comment.commentId} className="comment mb-4 p-3 border rounded space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <strong>{comment.userName}:</strong> <span>{comment.commentText}</span>
              </div>
              {(isAdmin || (currentUser && currentUser.userId === comment.userId)) && (
                <button
                  onClick={() => handleDeleteComment(comment.commentId)}
                  style={{
                    color: "black",
                    marginLeft: "5px",
                    background: "transparent"
                  }}
                >
                  <Trash2 />
                </button>
              )}
            </div>

            {comment.chefReplyText && (
              <div className="ml-4 p-2 bg-gray-100 border-l-4 border-green-500 rounded">
                <strong>Chef's answer:</strong> <span>{comment.chefReplyText}</span>
              </div>
            )}
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

}
export default RecipeDiscussion;

