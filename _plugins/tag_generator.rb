module Jekyll
  class TagGenerator < Generator
    safe true
    priority :low

    def generate(site)
      # Collect all tags from posts with their original case
      tags = {}
      tag_names = {} # Store original case for display
      
      site.posts.docs.each do |post|
        next unless post.data['tags']
        post.data['tags'].each do |tag|
          original_tag = tag.to_s
          tag_key = original_tag.downcase
          tags[tag_key] ||= []
          tags[tag_key] << post
          # Store the first occurrence's case as the display name
          tag_names[tag_key] ||= original_tag
        end
      end

      # Generate a page for each tag
      tags.each do |tag_key, posts|
        # Sort posts by date, newest first
        posts.sort! { |a, b| b.date <=> a.date }
        
        site.pages << TagPage.new(site, site.source, tag_key, tag_names[tag_key], posts)
      end
    end
  end

  class TagPage < Page
    def initialize(site, base, tag_key, tag_name, posts)
      @site = site
      @base = base
      @dir = File.join('tag', tag_key)
      @name = 'index.html'

      self.process(@name)
      
      # Create page content
      self.data = {}
      self.data['layout'] = 'tag'
      self.data['title'] = tag_name
      self.data['tag'] = tag_key
      self.data['posts'] = posts
      
      # Set content to empty - layout will handle rendering
      self.content = ''
    end
  end
end

