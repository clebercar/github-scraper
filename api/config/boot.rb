ENV["BUNDLE_GEMFILE"] ||= File.expand_path("../Gemfile", __dir__)

# Fix for Ruby 3.3.0 compatibility - require cgi before bundler
if RUBY_VERSION >= "3.3.0"
  require "cgi"
end

require "bundler/setup" # Set up gems listed in the Gemfile.
require "bootsnap/setup" # Speed up boot time by caching expensive operations.
