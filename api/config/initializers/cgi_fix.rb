# Fix for Ruby 3.3.0 compatibility issue with CGI gem
# This ensures CGI is properly loaded before GlobalID uses it
if RUBY_VERSION >= "3.3.0"
  require "cgi"
  # Ensure CGI is initialized properly for Ruby 3.3.0
  begin
    CGI.escape("test")
  rescue
    # Ignore if already initialized
  end
end

