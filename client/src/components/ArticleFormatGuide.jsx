import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Info } from 'lucide-react';
import '../styles/ArticleFormatGuide.css';

export default function ArticleFormatGuide() {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatExample = `Title: [Your Article Title]

Content:
[Your article content goes here. This can be multiple paragraphs covering your topic in detail.

You can include additional paragraphs by separating them with blank lines like this.

Continue writing your article content with proper paragraph breaks and formatting as needed.]`;

  const fieldDescriptions = [
    { field: "Title", description: "The main headline of your article - should be clear and engaging" },
    { field: "Content", description: "The main body of your article - can include multiple paragraphs separated by blank lines" }
  ];

  return (
    <div className="article-format-container">
      <div className="button-container">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="format-guide-button"
        >
          <div className="icon-container">
            <FileText size={24} />
          </div>
          <div className="text-container">
            <h2 className="button-title">Article File Format Guide</h2>
            <p className="button-description">Click to see the expected format for article uploads</p>
          </div>
          <div className="chevron-container">
            {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </div>
        </button>
      </div>

      {isExpanded && (
        <div className="expanded-content">
          <div className="info-box">
            <Info className="info-icon" size={20} />
            <div>
              <h3 className="info-title">Important Notes:</h3>
              <ul className="info-list">
                <li>Keep the exact structure and spacing as shown</li>
                <li>Use blank lines to separate paragraphs in the content</li>
                <li>All text should be in a .txt or .docx file format</li>
                <li>No special formatting needed - plain text is fine</li>
              </ul>
            </div>
          </div>

          <div className="content-grid">
            <div className="format-section">
              <h3 className="section-title">Expected File Format:</h3>
              <div className="format-example">
                <pre className="format-text">{formatExample}</pre>
              </div>
            </div>

            <div className="descriptions-section">
              <h3 className="section-title">Field Descriptions:</h3>
              <div className="field-descriptions">
                {fieldDescriptions.map((item, index) => (
                  <div key={index} className="field-item">
                    <h4 className="field-name">{item.field}</h4>
                    <p className="field-description">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="tips-box">
            <h3 className="tips-title">Quick Tips:</h3>
            <div className="tips-grid">
              <ul className="tips-column">
                <li>Save as .txt or .docx file</li>
                <li>Keep formatting consistent</li>
                <li>Use clear, descriptive titles</li>
              </ul>
              <ul className="tips-column">
                <li>Write engaging, informative content</li>
                <li>Separate paragraphs with blank lines</li>
                <li>Proofread before uploading!</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}