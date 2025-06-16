import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, X } from 'lucide-react';
import { getRequest } from '../Requests';
import '../styles/SearchBar.css';

export default function SearchFilterBar({ setRecipes }) {
  const [showFilters, setShowFilters] = useState(false);
  const [tags, setTags] = useState([]);
  
  // Centralized search state object
  const [searchParams, setSearchParams] = useState({
    title: '',
    category: 'all',
    sortBy: 'relevance',
    tags: []
  });

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

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await getRequest('tags');
        setTags(response.data);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };
    fetchTags();
  }, []);

  // Generic function to build API call based on search params
  const buildApiQuery = (params) => {
    const queryParts = ['limit=10', 'page=1'];
    
    if (params.title && params.title.trim()) {
      queryParts.push(`title=${encodeURIComponent(params.title.trim())}`);
    }
    
    if (params.category && params.category !== 'all') {
      queryParts.push(`category=${params.category}`);
    }
    
    if (params.tags && params.tags.length > 0) {
      queryParts.push(`anyTags=${params.tags.join(',')}`);
    }
    
    if (params.sortBy && params.sortBy !== 'relevance') {
      queryParts.push(`sortBy=${params.sortBy}`);
    }
    
    return `recipes?${queryParts.join('&')}`;
  };

  // Generic function to execute search
  const executeSearch = async (params = searchParams) => {
    try {
      const apiQuery = buildApiQuery(params);
      console.log('API Query:', apiQuery);
      const response = await getRequest(apiQuery);
      console.log('Search Response:', response);
      setRecipes(response.data);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  // Generic function to update search params and trigger search
  const updateSearchParam = (key, value) => {
    const newParams = { ...searchParams, [key]: value };
    setSearchParams(newParams);
    executeSearch(newParams);
  };

  // Generic function to remove a search param value
  const removeSearchParam = (key, value = null) => {
    let newParams = { ...searchParams };
    
    if (key === 'tags' && value) {
      // Remove specific tag
      newParams.tags = newParams.tags.filter(tag => tag !== value);
    } else if (key === 'title') {
      newParams.title = '';
    } else if (key === 'category') {
      newParams.category = 'all';
    } else if (key === 'sortBy') {
      newParams.sortBy = 'relevance';
    } else {
      // Reset the entire key to default
      switch (key) {
        case 'title':
          newParams.title = '';
          break;
        case 'category':
          newParams.category = 'all';
          break;
        case 'sortBy':
          newParams.sortBy = 'relevance';
          break;
        case 'tags':
          newParams.tags = [];
          break;
        default:
          break;
      }
    }
    
    setSearchParams(newParams);
    executeSearch(newParams);
  };

  const toggleTag = (tagName) => {
    const newTags = searchParams.tags.includes(tagName)
      ? searchParams.tags.filter(tag => tag !== tagName)
      : [...searchParams.tags, tagName];
    
    updateSearchParam('tags', newTags);
  };

  const clearAllFilters = () => {
    const defaultParams = {
      title: '',
      category: 'all',
      sortBy: 'relevance',
      tags: []
    };
    setSearchParams(defaultParams);
    executeSearch(defaultParams);
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return searchParams.title || 
           searchParams.category !== 'all' || 
           searchParams.sortBy !== 'relevance' || 
           searchParams.tags.length > 0;
  };

  return (
    <div className="search-container">
      <div className="searchContainer">
        <div className="relative">
          <Search className="searchIcon" />
          <input
            type="text"
            placeholder="Search anything..."
            value={searchParams.title}
            onChange={(e) => setSearchParams(prev => ({ ...prev, title: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                executeSearch();
              }
            }}
            className="searchInput"
          />
          {searchParams.title && (
            <button 
              onClick={() => removeSearchParam('title')} 
              className="clearButton"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="filterControls">
        <div className="selectWrapper">
          <select
            value={searchParams.category}
            onChange={(e) => updateSearchParam('category', e.target.value)}
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
            value={searchParams.sortBy}
            onChange={(e) => updateSearchParam('sortBy', e.target.value)}
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

        {hasActiveFilters() && (
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
              {tags.map(({ tagId, name }) => (
                <button
                  key={tagId}
                  onClick={() => toggleTag(name)}
                  className={`tagButton ${searchParams.tags.includes(name) ? 'tagButtonActive' : ''}`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {hasActiveFilters() && (
        <div className="activeFilters">
          <span className="activeFiltersLabel">Active filters:</span>

          {searchParams.title && (
            <span className="filterTag">
              Search: "{searchParams.title}"
              <button 
                onClick={() => removeSearchParam('title')} 
                className="filterTagRemove"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {searchParams.category !== 'all' && (
            <span className="filterTag">
              {categories.find(c => c.value === searchParams.category)?.label}
              <button 
                onClick={() => removeSearchParam('category')} 
                className="filterTagRemove"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {searchParams.tags.map(tag => (
            <span key={tag} className="filterTag">
              {tag}
              <button 
                onClick={() => removeSearchParam('tags', tag)} 
                className="filterTagRemove"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
