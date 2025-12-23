require 'rails_helper'

RSpec.describe ScrapeGithubProfileJob, type: :job do
  describe '#perform' do
    let(:member) { create(:member, scraping_status: :pending) }
    let(:profile_data) do
      {
        username: 'testuser',
        name: 'Test User',
        avatar_url: 'https://github.com/testuser.png',
        followers_count: 100,
        following_count: 50,
        starts_count: 200,
        public_repos_count: 30,
        total_contributions_last_year: 500,
        organizations: ['org1', 'org2'],
        location: 'San Francisco, CA'
      }
    end

    let(:scraper_instance) { instance_double(Github::ScrapeProfile) }

    context 'when scraping is successful' do
      before do
        allow(Github::ScrapeProfile).to receive(:new).with(member.url).and_return(scraper_instance)
        allow(scraper_instance).to receive(:run).and_return(profile_data)
      end

      it 'updates member status to processing and then completed' do
        expect { described_class.perform_now(member.id) }
          .to change { member.reload.scraping_status }
          .from('pending')
          .to('completed')
      end

      it 'updates member with profile data' do
        described_class.perform_now(member.id)

        member.reload
        expect(member.username).to eq(profile_data[:username])
        expect(member.name).to eq(profile_data[:name])
        expect(member.avatar_url).to eq(profile_data[:avatar_url])
        expect(member.followers_count).to eq(profile_data[:followers_count])
        expect(member.following_count).to eq(profile_data[:following_count])
        expect(member.starts_count).to eq(profile_data[:starts_count])
        expect(member.public_repos_count).to eq(profile_data[:public_repos_count])
        expect(member.total_contributions_last_year).to eq(profile_data[:total_contributions_last_year])
        expect(member.organizations).to eq(profile_data[:organizations])
        expect(member.location).to eq(profile_data[:location])
      end

      it 'preserves existing name when profile data name is nil' do
        original_name = member.name
        profile_data_without_name = profile_data.merge(name: nil)
        allow(scraper_instance).to receive(:run).and_return(profile_data_without_name)

        described_class.perform_now(member.id)

        member.reload
        expect(member.name).to eq(original_name)
      end

      it 'calls Github::ScrapeProfile with the correct URL' do
        described_class.perform_now(member.id)

        expect(Github::ScrapeProfile).to have_received(:new).with(member.url)
        expect(scraper_instance).to have_received(:run)
      end
    end

    context 'when member is not found' do
      it 'logs an error and does not raise' do
        expect(Rails.logger).to receive(:error).with("Member #{999999} not found")

        expect { described_class.perform_now(999999) }.not_to raise_error
      end
    end

    context 'when scraping fails' do
      let(:error_message) { 'Network error' }

      before do
        allow(Github::ScrapeProfile).to receive(:new).with(member.url).and_return(scraper_instance)
        allow(scraper_instance).to receive(:run).and_raise(StandardError.new(error_message))
      end

      it 'logs an error' do
        expect(Rails.logger).to receive(:error).with("Failed to scrape GitHub profile for member #{member.id}: #{error_message}")

        described_class.perform_now(member.id)
      end

      it 'updates member status to failed' do
        expect { described_class.perform_now(member.id) }
          .to change { member.reload.scraping_status }
          .from('pending')
          .to('failed')
      end

      it 'does not update member profile data' do
        original_username = member.username
        original_followers_count = member.followers_count

        described_class.perform_now(member.id)

        member.reload
        expect(member.username).to eq(original_username)
        expect(member.followers_count).to eq(original_followers_count)
      end
    end
  end
end

