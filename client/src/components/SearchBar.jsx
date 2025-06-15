import React, { useState } from 'react';
import { Search, Filter, ChevronDown, X } from 'lucide-react';
import '../styles/SearchBar.css'; // Assuming you have a CSS file for styling

export default function SearchFilterBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'meat', label: 'Meat' },
    { value: 'parve', label: 'Parve' },
    { value: 'dairy', label: 'Dairy' }
  ];

  const sortOptions = [
    { value: 'rating', label: 'Rating' },
    { value: 'name-asc', label: 'Name A-Z' },
    { value: 'name-desc', label: 'Name Z-A' }
  ];

  const availableTags = ['Featured', 'Popular', 'New', 'Sale', 'Premium'];

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearSearch = () => setSearchTerm('');

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSortBy('relevance');
    setSelectedTags([]);
    setSearchTerm('');
  };

  return (
    <div className="search-container" >
      <div className="searchContainer">
        <div className="relative">
          <Search className="searchIcon" />
          <input
            type="text"
            placeholder="Search anything..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="searchInput"
          />
          {searchTerm && (
            <button onClick={clearSearch} className="clearButton">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="filterControls">
        <div className="selectWrapper">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="select"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <ChevronDown className="selectArrow" />
        </div>

        <div className="selectWrapper">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="select"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <ChevronDown className="selectArrow" />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`filterButton ${showFilters ? 'filterButtonActive' : ''}`}
        >
          <Filter size={16} />
          Filters
        </button>

        {(selectedCategory !== 'all' || sortBy !== 'relevance' || selectedTags.length > 0 || searchTerm) && (
          <button onClick={clearAllFilters} className="clearAllButton">
            Clear all
          </button>
        )}
      </div>

      {showFilters && (
        <div className="filtersPanel">
          <h3 className="filtersPanelTitle">Filter Options</h3>

          <div className="filterGroup">
            <label className="filterLabel">Tags</label>
            <div className="tagsContainer">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`tagButton ${selectedTags.includes(tag) ? 'tagButtonActive' : ''}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="dateInputs">
            <div>
              <label className="filterLabel">From Date</label>
              <input type="date" className="dateInput" />
            </div>
            <div>
              <label className="filterLabel">To Date</label>
              <input type="date" className="dateInput" />
            </div>
          </div>
        </div>
      )}

      {(selectedTags.length > 0 || selectedCategory !== 'all' || searchTerm) && (
        <div className="activeFilters">
          <span className="activeFiltersLabel">Active filters:</span>

          {searchTerm && (
            <span className="filterTag">
              Search: "{searchTerm}"
              <button onClick={clearSearch} className="filterTagRemove">
                <X size={12} />
              </button>
            </span>
          )}

          {selectedCategory !== 'all' && (
            <span className="filterTag">
              {categories.find(c => c.value === selectedCategory)?.label}
              <button onClick={() => setSelectedCategory('all')} className="filterTagRemove">
                <X size={12} />
              </button>
            </span>
          )}

          {selectedTags.map(tag => (
            <span key={tag} className="filterTag">
              {tag}
              <button onClick={() => toggleTag(tag)} className="filterTagRemove">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
