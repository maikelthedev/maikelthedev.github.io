---
layout: default
title: "Categories"
permalink: /categories/
---

<div class="categories-page">
  <h1>Categories</h1>
  <p class="categories-description">Browse posts by topic and tag.</p>

  <div class="categories-list">
    {% assign all_tags = site.posts | map: 'tags' | flatten | uniq | sort %}
    {% for tag in all_tags %}
      {% if tag != nil and tag != '' %}
        {% assign tag_posts = site.posts | where_exp: "post", "post.tags contains tag" | sort: 'date' | reverse %}
        {% assign latest_post = tag_posts | first %}
        <div class="category-item">
          {% if latest_post.image %}
          <a href="{{ '/tag/' | append: tag | downcase | append: '/' | relative_url }}" class="category-image">
            <img src="{{ latest_post.image | relative_url }}" alt="{{ tag }}">
          </a>
          {% endif %}
          <div class="category-content">
            <h2>
              <a href="{{ '/tag/' | append: tag | downcase | append: '/' | relative_url }}">{{ tag }}</a>
            </h2>
            <p class="category-count">{{ tag_posts.size }} {% if tag_posts.size == 1 %}post{% else %}posts{% endif %}</p>
          </div>
        </div>
      {% endif %}
    {% endfor %}
  </div>
</div>

