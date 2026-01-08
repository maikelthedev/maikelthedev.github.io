/*!
 * Simple-Jekyll-Search v1.10.0
 * https://github.com/christian-fei/Simple-Jekyll-Search
 */
(function() {
  'use strict';

  var _$ = {
    merge: function merge(defaultParams, params) {
      var merged = {};
      for (var key in defaultParams) {
        merged[key] = defaultParams[key];
        if (typeof params !== 'undefined' && typeof params[key] !== 'undefined') {
          merged[key] = params[key];
        }
      }
      return merged;
    },
    jsonEscape: function(str) {
      return str.replace(/\n/g, '\\\\n').replace(/\r/g, '\\\\r').replace(/\t/g, '\\\\t');
    },
    isArray: function isArray(obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
    },
    escapeRegExp: function escapeRegExp(str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    }
  };

  var SimpleJekyllSearch = function SimpleJekyllSearch(options) {
    this.options = _$.merge(SimpleJekyllSearch.defaultOptions, options);
    // Initialize searchOptions with defaults if not provided
    this.options.searchOptions = _$.merge({
      matchAllWords: false,
      fuzzy: options.fuzzy || false,
      caseSensitive: false,
      minLength: 0,
      pattern: ''
    }, options.searchOptions || {});
    // Matcher will be created when needed
    this.matcher = null;
  };

  SimpleJekyllSearch.defaultOptions = {
    searchInput: null,
    resultsContainer: null,
    json: [],
    success: function(data) {
      return data;
    },
    searchResultTemplate: '<li><a href="{url}">{title}</a></li>',
    templateMiddleware: function(values) {
      return values;
    },
    sortMiddleware: function() {
      return 0;
    },
    noResultsText: 'No results found',
    limit: 10,
    fuzzy: false,
    exclude: []
  };

  SimpleJekyllSearch.prototype = {
    init: function init() {
      var self = this;
      var options = self.options;

      if (!options.searchInput || !options.resultsContainer) {
        throw new Error('SimpleJekyllSearch --- Error: Must define a search input and a results container on the page');
      }

      var json = options.json;
      if (typeof json === 'string') {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', options.json, true);
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 0) {
              var response = xhr.responseText;
              var json = JSON.parse(response);
              self.data = json;
              self._attachSearchListener();
            } else {
              throw new Error('SimpleJekyllSearch --- Error: ' + xhr.status + ' while fetching JSON file at ' + options.json);
            }
          }
        };
        xhr.send();
      } else if (typeof json === 'object') {
        self.data = json;
        self._attachSearchListener();
      } else {
        throw new Error('SimpleJekyllSearch --- Error: JSON is neither a valid URL string nor a valid object');
      }
    },

    search: function search(data, searchInput, resultsContainer) {
      var self = this;
      var options = self.options;

      var searchQuery = searchInput.value.trim();
      if (searchQuery.length < options.searchOptions.minLength) {
        resultsContainer.innerHTML = '';
        return;
      }

      // Update the pattern in searchOptions
      options.searchOptions.pattern = searchQuery;

      var matchingResults = [];
      for (var i = 0; i < data.length && matchingResults.length < options.limit; i++) {
        var textToSearch = '';
        if (options.searchOptions.searchableFields && _$.isArray(options.searchOptions.searchableFields)) {
          for (var j = 0; j < options.searchOptions.searchableFields.length; j++) {
            textToSearch += data[i][options.searchOptions.searchableFields[j]] + ' ';
          }
        } else {
          textToSearch = (data[i].title || '') + ' ' + (data[i].content || '') + ' ' + (data[i].excerpt || '');
        }

        if (self._doesTextMatchQuery(textToSearch, searchQuery)) {
          matchingResults.push(data[i]);
        }
      }

      if (matchingResults.length === 0) {
        resultsContainer.innerHTML = options.noResultsText;
        return;
      }

      resultsContainer.innerHTML = matchingResults.map(function(result) {
        return self._render(result);
      }).join('');
    },

    _doesTextMatchQuery: function _doesTextMatchQuery(text, query) {
      if (!query || query.length === 0) {
        return false;
      }
      var searchOptions = this.options.searchOptions;
      
      // Ensure case-insensitive search
      if (!searchOptions.caseSensitive) {
        text = text.toLowerCase();
        query = query.toLowerCase();
      }
      
      // Simple substring matching - more reliable than complex regex
      if (text.indexOf(query) !== -1) {
        return true;
      }
      
      // If fuzzy matching is enabled, try fuzzy pattern
      if (searchOptions.fuzzy) {
        var fuzzyPattern = this._fuzzyfy(query);
        var escapedPattern = _$.escapeRegExp(fuzzyPattern);
        var matcher = new RegExp(escapedPattern, searchOptions.caseSensitive ? 'g' : 'gi');
        return matcher.test(text);
      }
      
      return false;
    },

    _fuzzyfy: function _fuzzyfy(string) {
      return string.split('').reduce(function(a, b) {
        return a + '.*' + b;
      });
    },

    _render: function _render(result) {
      var self = this;
      var options = self.options;
      var template = options.searchResultTemplate;
      var values = {};
      for (var key in result) {
        values[key] = result[key];
      }
      var processedValues = options.templateMiddleware(values);
      // Use processed values if templateMiddleware returns something, otherwise use original values
      values = processedValues !== undefined ? processedValues : values;
      return template.replace(/\{(\w+)\}/g, function(match, key) {
        return typeof values[key] !== 'undefined' ? _$.jsonEscape(String(values[key])) : '';
      });
    },

    _attachSearchListener: function _attachSearchListener() {
      var self = this;
      var searchInput = self.options.searchInput;
      var resultsContainer = self.options.resultsContainer;
      
      searchInput.addEventListener('input', function() {
        self.search(self.data, searchInput, resultsContainer);
      });
      
      // Initial search if there's a value
      if (searchInput.value) {
        self.search(self.data, searchInput, resultsContainer);
      }
    }
  };

  window.SimpleJekyllSearch = function(options) {
    // Merge searchOptions before creating instance
    var mergedOptions = _$.merge(SimpleJekyllSearch.defaultOptions, options);
    mergedOptions.searchOptions = _$.merge({
      matchAllWords: false,
      fuzzy: options.fuzzy || false,
      caseSensitive: false,
      minLength: 0,
      pattern: ''
    }, options.searchOptions || {});
    
    var instance = new SimpleJekyllSearch(mergedOptions);
    instance.options.searchInput = typeof options.searchInput === 'string' ? document.querySelector(options.searchInput) : options.searchInput;
    instance.options.resultsContainer = typeof options.resultsContainer === 'string' ? document.querySelector(options.resultsContainer) : options.resultsContainer;
    instance.init();
    return instance;
  };
})();

