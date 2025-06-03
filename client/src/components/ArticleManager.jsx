// ArticleManager.jsx
import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import AddArticle from './AddArticle';
import ArticleLibrary from './ArticleLibrary';
import '../styles/ArticleManager.css'; // Adjust the path as needed

const ArticleManager = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [articles, setArticles] = useState([]);

  const addArticle = (newArticle) => {
    const article = {
      id: Date.now(),
      ...newArticle,
      createdAt: new Date().toLocaleDateString()
    };
    setArticles([...articles, article]);
  };

  const deleteArticle = (id) => {
    setArticles(articles.filter(article => article.id !== id));
  };

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

        <div className="tabs">
          <button onClick={() => setActiveTab('create')} className={activeTab === 'create' ? 'active' : ''}>Create Article</button>
          <button onClick={() => setActiveTab('library')} className={activeTab === 'library' ? 'active' : ''}>
            Article Library ({articles.length})
          </button>
        </div>

        {activeTab === 'create' ? (
          <AddArticle onSave={addArticle} />
        ) : (
          <ArticleLibrary articles={articles} onDelete={deleteArticle} onCreateClick={() => setActiveTab('create')} />
        )}
      </div>
    </div>
  );
};

export default ArticleManager;

