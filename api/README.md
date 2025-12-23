# README

This README would normally document whatever steps are necessary to get the
application up and running.

## Running Tests

This project uses RSpec for testing. Since we're using Docker, you can run tests in the following ways:

### Run all tests

```bash
# Simple way - environment is automatically set in spec_helper.rb
docker-compose exec api bundle exec rspec

# Or using direct docker exec
docker exec github_scrapper_api bundle exec rspec

# Alternative: using bin/rspec helper script (also works)
docker-compose exec api bundle exec bin/rspec
```

### Run a specific test file

```bash
docker-compose exec api bundle exec rspec spec/models/member_spec.rb
```

### Run tests with specific options

```bash
# Run with documentation format
docker-compose exec api bundle exec rspec --format documentation

# Run only focused tests
docker-compose exec api bundle exec rspec --tag focus

# Run tests matching a pattern
docker-compose exec api bundle exec rspec spec/models/
```

### Setup test database

Before running tests for the first time, you need to create and setup the test database:

```bash
# Create test database
docker-compose exec -e RAILS_ENV=test -e DATABASE_URL=postgresql://postgres:postgres@db:5432/app_test api bundle exec rails db:create

# Load schema (alternative to migrations)
docker-compose exec -e RAILS_ENV=test -e DATABASE_URL=postgresql://postgres:postgres@db:5432/app_test api bundle exec rails db:schema:load
```

### Running tests from outside Docker

If you prefer to run tests directly (without docker-compose exec), you can also use:

```bash
docker-compose run --rm api bundle exec rspec
```

## Test Configuration

- **RSpec** is configured in `spec/rails_helper.rb` and `spec/spec_helper.rb`
- **Environment variables** (`RAILS_ENV` and `DATABASE_URL`) are automatically set in `spec_helper.rb`, so you can run `bundle exec rspec` directly without manual setup
- **FactoryBot** is set up for test data generation (see `spec/factories/`)
- **Shoulda Matchers** is configured for easier model testing
- **Database Cleaner** is available but not required when using transactional fixtures (default)

## Writing Tests

Test files should be placed in the `spec/` directory following Rails conventions:

- `spec/models/` - Model specs
- `spec/controllers/` - Controller specs
- `spec/services/` - Service specs
- `spec/jobs/` - Job specs
- `spec/requests/` - Request specs (integration tests)

Example model spec:

```ruby
require 'rails_helper'

RSpec.describe Member, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:name) }
  end
end
```
