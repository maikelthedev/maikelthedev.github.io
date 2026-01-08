---
layout: default
title: "Home"
pagination:
  enabled: true
---

{% assign all_featured = site.posts | where: "featured", true | sort: "date" | reverse %}
{% assign featured_posts = "" | split: "" %}
{% for post in all_featured %}
  {% if featured_posts.size < 3 %}
    {% assign featured_posts = featured_posts | push: post %}
  {% endif %}
{% endfor %}

{% if featured_posts.size > 0 %}
<div class="featured-posts">
  {% for post in featured_posts %}
    {% if forloop.first %}
    <article class="featured-post-large">
      {% if post.image %}
      <a href="{{ post.url | relative_url }}" class="featured-post-image">
        <img src="{{ post.image | relative_url }}" alt="{{ post.title }}">
      </a>
      {% endif %}
      <div class="featured-post-content">
        <h2 class="featured-post-title">
          <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
        </h2>
        {% if post.excerpt %}
        <p class="featured-post-excerpt">{{ post.excerpt }}</p>
        {% endif %}
        <div class="featured-post-meta">
          <span class="featured-post-author">{{ site.author | default: "Maikel Frias Mosquea" }}</span>
          <span class="featured-post-date">{{ post.date | date: "%d %b %Y" }}</span>
        </div>
      </div>
    </article>
    {% endif %}
  {% endfor %}
  <div class="featured-posts-small">
    {% for post in featured_posts %}
      {% unless forloop.first %}
      <article class="featured-post-small">
        {% if post.image %}
        <a href="{{ post.url | relative_url }}" class="featured-post-image">
          <img src="{{ post.image | relative_url }}" alt="{{ post.title }}">
        </a>
        {% endif %}
        <div class="featured-post-content">
          <h2 class="featured-post-title">
            <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
          </h2>
          {% if post.excerpt %}
          <p class="featured-post-excerpt">{{ post.excerpt }}</p>
          {% endif %}
          <div class="featured-post-meta">
            <span class="featured-post-author">{{ site.author | default: "Maikel Frias Mosquea" }}</span>
            <span class="featured-post-date">{{ post.date | date: "%d %b %Y" }}</span>
          </div>
        </div>
      </article>
      {% endunless %}
    {% endfor %}
  </div>
</div>
{% endif %}

<h2 class="section-heading">All Posts</h2>
<div class="home-posts" id="posts">
  {% for post in site.posts %}
    <article class="post-card">
      {% if post.image %}
      <a href="{{ post.url | relative_url }}" class="post-card-image">
        <img src="{{ post.image | relative_url }}" alt="{{ post.title }}">
      </a>
      {% endif %}
      <div class="post-card-content">
        <h2 class="post-card-title">
          <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
        </h2>
        {% if post.excerpt %}
        <p class="post-card-excerpt">{{ post.excerpt }}</p>
        {% endif %}
        <div class="post-card-meta">
          <span class="post-card-author">{{ site.author | default: "Maikel Frias Mosquea" }}</span>
          <span class="post-card-date">{{ post.date | date: "%d %b %Y" }}</span>
        </div>
      </div>
    </article>
  {% endfor %}
</div>
