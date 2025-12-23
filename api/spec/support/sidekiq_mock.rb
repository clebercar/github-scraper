RSpec.configure do |config|
  config.before(:each) do
    allow(Sidekiq.logger).to receive(:info)
    allow(Sidekiq.logger).to receive(:warn)
    allow(Sidekiq.logger).to receive(:error)

    allow(Sidekiq::Client).to receive(:push).and_return(true)
    allow_any_instance_of(Sidekiq::Client).to receive(:push).and_return(true)
    
    allow(Sidekiq).to receive(:redis) do |&block|
      redis_mock = Object.new
      def redis_mock.ping; 'PONG'; end
      def redis_mock.get(*); nil; end
      def redis_mock.set(*); 'OK'; end
      def redis_mock.del(*); 0; end
      def redis_mock.exists(*); false; end
      def redis_mock.keys(*); []; end
      def redis_mock.flushdb; 'OK'; end
      def redis_mock.info(*); {}; end
      def redis_mock.quit; 'OK'; end
      block.call(redis_mock) if block
      redis_mock
    end
  end
end

