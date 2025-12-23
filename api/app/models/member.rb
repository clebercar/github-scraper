# == Schema Information
#
# Table name: members
#
#  id                            :bigint           not null, primary key
#  avatar_url                    :string
#  followers_count               :integer
#  following_count               :integer
#  location                      :string
#  name                          :string           not null
#  organizations                 :text             default([]), is an Array
#  public_repos_count            :integer
#  scraping_status               :integer          default("pending"), not null
#  short_url                     :string
#  starts_count                  :integer
#  total_contributions_last_year :integer
#  url                           :string           not null
#  username                      :string
#  created_at                    :datetime         not null
#  updated_at                    :datetime         not null
#
# Indexes
#
#  index_members_on_short_url  (short_url) UNIQUE
#
class Member < ApplicationRecord
  after_create :generate_short_url

  validates :name, presence: true
  validates :url, presence: true

  enum scraping_status: {
    pending: 0,
    processing: 1,
    completed: 2,
    failed: 3
  }

  private

  def generate_short_url
    sqids = Sqids.new(min_length: 6)
    self.short_url = "#{ENV.fetch("API_HOST")}/#{sqids.encode([self.id])}"
    self.save!
  end
end
