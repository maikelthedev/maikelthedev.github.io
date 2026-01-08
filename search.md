---
layout: default
title: "Search"
permalink: /search/
---

<div class="search-page">
  <h1>Search</h1>
  
  <div class="search-container">
    <input type="text" id="search-input" placeholder="Search posts..." autofocus>
    <div id="search-results"></div>
  </div>
</div>

<script src="{{ '/assets/js/simple-jekyll-search.js' | relative_url }}"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    var searchInput = document.getElementById('search-input');
    var resultsContainer = document.getElementById('search-results');
    
    if (!searchInput || !resultsContainer) {
      console.error('Search: Missing required elements');
      return;
    }
    
    try {
      SimpleJekyllSearch({
        searchInput: searchInput,
        resultsContainer: resultsContainer,
        json: '{{ "/assets/search.json" | relative_url }}',
        searchResultTemplate: '<article class="search-result"><h2><a href="{url}">{title}</a></h2><p>{excerpt}</p><div class="search-meta"><span>{date}</span></div></article>',
        noResultsText: '<p class="no-results">No results found.</p>',
        limit: 10,
        fuzzy: true,
        searchOptions: {
          fuzzy: true,
          matchAllWords: false,
          caseSensitive: false,
          minLength: 1
        }
      });
    } catch (error) {
      console.error('Search initialization error:', error);
      resultsContainer.innerHTML = '<p class="no-results">Search is currently unavailable.</p>';
    }
  });
</script>

