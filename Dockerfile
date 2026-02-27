FROM jekyll/jekyll:4

# Copy Gemfile and install dependencies into the image
COPY Gemfile /srv/jekyll/Gemfile
RUN bundle install --jobs 4 --retry 3

WORKDIR /srv/jekyll
