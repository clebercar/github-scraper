require 'rails_helper'

RSpec.describe Member, type: :model do
  describe 'enums' do
    it 'has scraping_status enum' do
      expect(described_class.scraping_statuses.keys).to match_array(%w[pending processing completed failed])
    end
  end
  describe 'instance methods' do
    let(:member) { create(:member) }

    it 'is valid with valid attributes' do
      expect(member).to be_valid
    end

    it 'generates a short_url after creation' do
      member = create(:member)
      expect(member.short_url).to be_present
      expect(member.short_url).to include(ENV.fetch('API_HOST', 'http://localhost:3000'))
    end
  end
end

