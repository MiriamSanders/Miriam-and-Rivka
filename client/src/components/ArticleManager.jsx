
import React from 'react';
import { FileText } from 'lucide-react';
import AddArticle from './AddArticle';
import '../styles/ArticleManager.css';

const ArticleManager = () => {
  return (
    <div className="article-manager">
      <div className="container">
        <div className="header">
          <div className="header-icon-text">
            <FileText className="header-icon" size={40} />
            <h1>Article Manager</h1>
          </div>
          <p>Create articles manually or import from documents</p>
        </div>
        
        <AddArticle />
      </div>
    </div>
  );
};

export default ArticleManager;