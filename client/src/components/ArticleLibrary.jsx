import React from 'react';
import { BookOpen, Trash2 } from 'lucide-react';

const ArticleLibrary = ({ articles, onDelete, onCreateClick }) => {
  if (articles.length === 0) {
    return (
      <div className="empty-library">
        <BookOpen size={64} />
        <h3>No articles yet</h3>
        <p>Start by creating your first article</p>
        <button onClick={onCreateClick}>Create Article</button>
      </div>
    );
  }

  return (
    <div className="article-list">
      {articles.map(article => (
        <div key={article.id} className="article-card">
          <div className="article-header">
            <h3>{article.title}</h3>
            <button onClick={() => onDelete(article.id)} title="Delete article">
              <Trash2 size={16} />
            </button>
          </div>
          <div className="article-meta">
            <span>By {article.author || 'Unknown'}</span> •
            <span>{article.readTime || 'N/A'}</span> •
            <span>{article.difficulty}</span> •
            <span>{article.category || 'Uncategorized'}</span>
          </div>
          <div className="article-content">
            <p>{article.content.length > 300 ? article.content.substring(0, 300) + '...' : article.content}</p>
          </div>
          <div className="article-footer">
            <span>Created: {article.createdAt}</span>
            <span>{article.content.split(' ').length} words</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArticleLibrary;

