# Use the official Ruby image as base
FROM ruby:3.3.0

# Install system dependencies
RUN apt-get update -qq && \
  apt-get install -y \
  build-essential \
  libpq-dev \
  nodejs \
  npm \
  git \
  curl \
  && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Rails
RUN gem install rails -v 7.2.0

# Install bundler
RUN gem install bundler

# Copy entrypoint script
COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]

# Copy Gemfile and Gemfile.lock (if exists)
COPY Gemfile Gemfile.lock* ./

# Install dependencies
RUN bundle install

# Copy the rest of the application
COPY . .

# Expose port 3000
EXPOSE 3000

# Default command
CMD ["rails", "server", "-b", "0.0.0.0"]

