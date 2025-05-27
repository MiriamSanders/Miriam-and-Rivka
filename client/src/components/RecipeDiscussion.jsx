import React, { useState } from "react";

const RecipeDiscussion = ({ recipeId }) => {
  const [comments, setComments] = useState([
    { user: "Alice", text: "Can I use almond milk instead?" },
    { user: "Bob", text: "Tried it with extra garlic – amazing!" },
  ]);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (newComment.trim() === "") return;
    setComments([...comments, { user: "You", text: newComment }]);
    setNewComment("");
  };

  return (
    <div className="discussion-container">
      <h2 className="section-title">Questions & Responses</h2>
      <div className="comments-list">
        {comments.map((comment, index) => (
          <div key={index} className="comment">
            <strong>{comment.user}:</strong> <span>{comment.text}</span>
          </div>
        ))}
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
