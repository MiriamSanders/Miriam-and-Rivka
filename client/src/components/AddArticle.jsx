// AddArticle.jsx
import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import * as mammoth from 'mammoth';

const AddArticle = ({ onSave }) => {
  const [newArticle, setNewArticle] = useState({
    title: '',
    author: '',
    content: ''
  });

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    let text = '';

    if (file.name.endsWith('.txt')) {
      text = await file.text();
    } else if (file.name.endsWith('.docx')) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      text = result.value;
    }

    // Parse title, author, and content
    const lines = text.split('\n').map(line => line.trim());
    let title = '', author = '', content = '';
    let inContent = false;

    for (const line of lines) {
      if (line.toLowerCase().startsWith('title:')) {
        title = line.slice(6).trim();
      } else if (line.toLowerCase().startsWith('author:')) {
        author = line.slice(7).trim();
      } else if (line.toLowerCase().startsWith('content:')) {
        inContent = true;
      } else if (inContent) {
        content += line + '\n';
      }
    }

    setNewArticle(prev => ({
      ...prev,
      title,
      author,
      content: content.trim()
    }));
  } catch (error) {
    alert('Error reading file: ' + error.message);
  }
};


  const save = () => {
    if (newArticle.title.trim() && newArticle.content.trim()) {
      onSave(newArticle);
      setNewArticle({ title: '', author: '', content: '' });
    }
  };

  return (
    <div className="form-card">
       <div className="upload-box">
                <Upload size={48} color="#9ca3af" />
                <div>
                  <label htmlFor="file-upload" className="upload-text" style={{cursor: 'pointer'}}>
                    Upload a recipe document
                  </label>
                  <div className="upload-subtext">
                    Supports .docx, .txt files
                  </div>
                  <input
                    id="file-upload" type="file" style={{ display: 'none' }}
                    accept=".docx,.txt"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>

      <div className="form-fields">
        <label>Article Name</label>
        <input type="text" value={newArticle.title} onChange={e => setNewArticle(prev => ({ ...prev, title: e.target.value }))} />

        <label>Author</label>
        <input type="text" value={newArticle.author} onChange={e => setNewArticle(prev => ({ ...prev, author: e.target.value }))} />

        <label>Content</label>
        <textarea value={newArticle.content} onChange={e => setNewArticle(prev => ({ ...prev, content: e.target.value }))} rows={8} />

        <button onClick={save} disabled={!newArticle.title.trim() || !newArticle.content.trim()}>
          Save Article
        </button>
      </div>
    </div>
  );
};

export default AddArticle;

// ArticleLibrary.jsx
