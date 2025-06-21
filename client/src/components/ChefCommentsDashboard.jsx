import React, { useEffect, useState } from 'react';
import { getRequest, postRequest } from '../Requests';
import { useErrorMessage } from "./useErrorMessage";
 function ChefCommentsDashboard() {
  const [comments, setComments] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
const [errorCode, setErrorCode] = useState(undefined);
  const errorMessage = useErrorMessage(errorCode);
  const chefId = JSON.parse(localStorage.getItem("currentUser")).id;
  useEffect(() => {
    const fetchData = async () => {
      try{
        const requestResult = await getRequest(`recipecomments/chef/${chefId}`);
         if (requestResult.succeeded) {
               const result = requestResult.data[0];
        const normalized = Array.isArray(result)
          ? result
          : result
          ? [result]
          : [];
      setComments(normalized);
       setErrorCode(undefined);
         } else {
          setErrorCode(requestResult.status);
        }}catch(error) {
        console.error("Error fetching chef data:", error);
        setErrorCode(500);
      }
    };
    fetchData();
  }, []);
  const handleReply = async (commentId,recipeId) => {
       try{
   const requestResult = await postRequest(`recipecomments/chef/${chefId}`, {recipeId:recipeId,parentCommentId: commentId,  commentText: replyContent});
        if (requestResult.succeeded) {
    setComments(prev =>
      prev.map(comment =>
        comment.commentId  === commentId ? { ...comment, chefReplyText: replyContent } : comment
      ))
      setErrorCode(undefined);}
     else {
          setErrorCode(requestResult.status);}
        }catch(error) {
        console.error("Error fetching chef data:", error);
        setErrorCode(500);
      }
    setReplyingTo(null);
    setReplyContent('');
  };

 return (
    <div style={{ padding: '1rem' }}>
      {errorMessage && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          ⚠️ {errorMessage}
        </div>
      )}
{console.log(comments)}
     {comments.length === 0 ? (
  <div style={{ textAlign: 'center', padding: '1rem', color: '#888' }}>
    אין לך עדיין תגובות להצגה.
  </div>
) : (
  comments.map(comment => (
    <div key={comment.commentId} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>recipe: {comment.recipeTitle}</div>
      <div><strong>{comment.userName}:</strong> {comment.commentText}</div>

      {comment.chefReplyText ? (
        <div style={{ background: '#f0f0f0', padding: '0.5rem', borderRadius: '6px', marginTop: '0.5rem' }}>
          <strong> your reply:</strong> {comment.chefReplyText}
        </div>
      ) : replyingTo === comment.commentId? (
        <div style={{ marginTop: '0.5rem' }}>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a comment..."
            style={{ width: '100%', minHeight: '60px', padding: '0.5rem', marginBottom: '0.5rem' }}
          />
          <div>
            <button onClick={() => handleReply(comment.commentId,comment.recipeId)} style={{ marginRight: '0.5rem' }}>Send a comment</button>
            <button onClick={() => setReplyingTo(null)}>cancle</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setReplyingTo(comment.commentId)} style={{ marginTop: '0.5rem' }}>reply</button>
      )}
    </div>
  ))
)}

    </div>
  );
}

export default ChefCommentsDashboard;
