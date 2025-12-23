# GitHub Scraper

A full-stack application for scraping and managing GitHub profile information. The project consists of a Rails API backend and a React frontend, designed to collect, store, and display GitHub user profile data.

## Project Overview

This application allows you to:

- Add GitHub profiles to scrape
- Automatically extract profile information (name, avatar, followers, following, stars, repositories, contributions, organizations, location)
- View and manage scraped member profiles
- Generate short URLs for easy profile sharing
- Process scraping jobs asynchronously using background workers

## Architecture

- **Backend (API)**: Ruby on Rails 7.2 API with PostgreSQL, Sidekiq for background jobs, and Redis
- **Frontend (Web)**: React 18 with TypeScript, Vite, Tailwind CSS, and shadcn/ui components
- **Infrastructure**: Docker Compose for containerized development

## Prerequisites

**Docker is required for this project.** Before you begin, ensure you have the following installed:

- [Docker](https://www.docker.com/get-started) (version 20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0 or higher)

## Quick Start

This project uses Docker Compose to set up all services automatically. All development is done within Docker containers.

### 1. Clone the repository

```bash
git clone <repository-url>
cd github-scrapper
```

### 2. Start all services

```bash
docker-compose up --build
```

This command will:

- Build and start the API server (Rails) on port 3000
- Build and start the Web frontend (React) on port 4000
- Start PostgreSQL database on port 5432
- Start Redis on port 6379
- Start Sidekiq worker for background jobs

### 3. Set up the database

In a new terminal, run:

```bash
docker-compose exec api bundle exec rails db:create
docker-compose exec api bundle exec rails db:migrate
```

Or run both in one command:

```bash
docker-compose exec api bundle exec rails db:setup
```

### 4. Access the applications

- **Web Frontend**: http://localhost:4000
- **API Backend**: http://localhost:3000
- **API Health Check**: http://localhost:3000/up

### 5. Stop the services

```bash
docker-compose down
```

To also remove volumes (database data):

```bash
docker-compose down -v
```

## Local Development Setup

This project requires Docker for local development. All services run in Docker containers, which ensures a consistent development environment.

### Starting Services

Start all services (API, Web, Database, Redis, Sidekiq):

```bash
docker-compose up --build
```

Or run in detached mode (background):

```bash
docker-compose up -d --build
```

### Working with the API Container

Execute commands in the API container:

```bash
# Access Rails console
docker-compose exec api rails console

# Run database migrations
docker-compose exec api bundle exec rails db:migrate

# Run RSpec tests
docker-compose exec api bundle exec rspec

# Install new gems (after updating Gemfile)
docker-compose exec api bundle install
```

### Working with the Web Container

Execute commands in the Web container:

```bash
# Install new npm packages (after updating package.json)
docker-compose exec web npm install

# Run tests
docker-compose exec web npm test

# Build for production
docker-compose exec web npm run build
```

### Viewing Logs

Monitor logs from all services:

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f sidekiq
```

### Restarting Services

Restart a specific service:

```bash
docker-compose restart api
docker-compose restart web
docker-compose restart sidekiq
```

### Rebuilding After Changes

If you make changes to Dockerfiles or dependencies, rebuild:

```bash
# Rebuild and restart all services
docker-compose up --build

# Rebuild specific service
docker-compose build api
docker-compose up -d api
```

## Environment Variables

### API Environment Variables

The API uses the following environment variables (set in `docker-compose.yml` or `.env`):

- `RAILS_ENV`: Rails environment (development, test, production)
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_SIDEKIQ_URL`: Redis connection URL for Sidekiq
- `API_HOST`: Base URL for the API (used for generating short URLs)

### Web Environment Variables

The Web app uses:

- `NODE_ENV`: Node environment (development, production)
- `VITE_API_URL`: API base URL (default: http://localhost:3000)

## Project Structure

```
github-scrapper/
├── api/                    # Rails API backend
│   ├── app/
│   │   ├── controllers/    # API controllers
│   │   ├── models/         # Data models (Member)
│   │   ├── services/       # Business logic (GitHub scraping)
│   │   └── jobs/           # Background jobs (Sidekiq)
│   ├── config/             # Rails configuration
│   ├── db/                 # Database migrations and schema
│   └── spec/               # RSpec tests
├── web/                    # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API client
│   │   └── types/          # TypeScript types
│   └── public/             # Static assets
└── docker-compose.yml      # Docker orchestration
```

## API Endpoints

- `GET /members` - List all members
- `POST /members` - Create a new member (triggers scraping job)
- `GET /members/:id` - Get a specific member
- `PATCH /members/:id` - Update a member
- `DELETE /members/:id` - Delete a member
- `GET /:short_code` - Redirect to member profile via short URL
- `GET /up` - Health check endpoint

## Running Tests

### API Tests (RSpec)

```bash
# Using Docker
docker-compose exec api bundle exec rspec

# Run specific test file
docker-compose exec api bundle exec rspec spec/models/member_spec.rb

# Run with documentation format
docker-compose exec api bundle exec rspec --format documentation
```

### Web Tests (Jest)

```bash
# Using Docker
docker-compose exec web npm test

# Run tests in watch mode
docker-compose exec web npm run test:watch

# Run tests with coverage
docker-compose exec web npm run test:coverage
```

## Background Jobs

The application uses Sidekiq for processing GitHub scraping jobs asynchronously. When you create a new member, a background job (`ScrapeGithubProfileJob`) is enqueued to fetch and parse the GitHub profile data.

To monitor Sidekiq jobs, you can use the Sidekiq web UI (if configured) or check the logs:

```bash
docker-compose logs sidekiq
```

## Database Migrations

To run migrations:

```bash
# Using Docker
docker-compose exec api bundle exec rails db:migrate

# Rollback last migration
docker-compose exec api bundle exec rails db:rollback
```

## Troubleshooting

### Port already in use

If you get a port conflict error, you can modify the ports in `docker-compose.yml` or stop the conflicting service.

### Database connection errors

Ensure PostgreSQL is running and accessible. Check the `DATABASE_URL` environment variable matches your database configuration.

### Redis connection errors

Ensure Redis is running. In Docker, Redis starts automatically with `docker-compose up`. Check Redis logs with `docker-compose logs redis`.

### Sidekiq not processing jobs

Check that:

1. Redis is running and accessible
2. Sidekiq worker is running (`docker-compose logs sidekiq`)
3. Jobs are being enqueued (check Rails logs)

## Development Tips

- The API uses Rails 7.2 with API mode
- The Web app uses Vite for fast HMR (Hot Module Replacement)
- Both apps support hot reloading in development mode
- Use `docker-compose logs -f` to follow logs from all services
- Use `docker-compose exec api rails console` to access Rails console
