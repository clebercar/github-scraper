class ScrapeGithubProfileJob < ApplicationJob
  queue_as :default

  def perform(member_id)
    member = Member.find(member_id)
    member.processing!

    profile_data = Github::ScrapeProfile.new(member.url).run

    update_member_with_profile_data(member, profile_data)
  rescue ActiveRecord::RecordNotFound
    Rails.logger.error("Member #{member_id} not found")
  rescue StandardError => e
    Rails.logger.error("Failed to scrape GitHub profile for member #{member_id}: #{e.message}")
    member&.failed!
  end

  private

  def update_member_with_profile_data(member, profile_data)
    member.update!(
      username: profile_data[:username],
      name: profile_data[:name] || member.name,
      avatar_url: profile_data[:avatar_url],
      followers_count: profile_data[:followers_count],
      following_count: profile_data[:following_count],
      starts_count: profile_data[:starts_count],
      public_repos_count: profile_data[:public_repos_count],
      total_contributions_last_year: profile_data[:total_contributions_last_year],
      organizations: profile_data[:organizations],
      location: profile_data[:location],
      scraping_status: :completed
    )
  end
end
