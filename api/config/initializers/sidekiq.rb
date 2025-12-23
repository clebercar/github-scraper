sidekiq_url = ENV.fetch("REDIS_SIDEKIQ_URL")

Sidekiq.configure_server do |config|
  config.redis = { url: sidekiq_url }
end

Sidekiq.configure_client do |config|
  config.redis = { url: sidekiq_url }
end

