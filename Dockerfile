FROM ruby:3.3-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential git && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /srv/jekyll
COPY Gemfile /srv/jekyll/Gemfile
RUN bundle install --jobs 4 --retry 3
