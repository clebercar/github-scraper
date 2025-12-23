FactoryBot.define do
  factory :member do
    name { Faker::Name.name }
    url { "https://github.com/#{Faker::Internet.username}" }
    username { Faker::Internet.username }
    avatar_url { Faker::Avatar.image }
    followers_count { Faker::Number.between(from: 0, to: 10000) }
    following_count { Faker::Number.between(from: 0, to: 5000) }
    public_repos_count { Faker::Number.between(from: 0, to: 500) }
    starts_count { Faker::Number.between(from: 0, to: 10000) }
    total_contributions_last_year { Faker::Number.between(from: 0, to: 5000) }
    scraping_status { :pending }
    organizations { [] }
    location { Faker::Address.city }
    short_url { nil }
  end
end

