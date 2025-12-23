require 'rails_helper'

RSpec.describe Github::ScrapeProfile do
  describe '#initialize' do
    context 'with full URL' do
      it 'normalizes https URL' do
        scraper = described_class.new('https://github.com/testuser')
        expect(scraper.instance_variable_get(:@url)).to eq('https://github.com/testuser')
        expect(scraper.instance_variable_get(:@username)).to eq('testuser')
      end

      it 'normalizes http URL' do
        scraper = described_class.new('http://github.com/testuser')
        expect(scraper.instance_variable_get(:@url)).to eq('http://github.com/testuser')
        expect(scraper.instance_variable_get(:@username)).to eq('testuser')
      end
    end

    context 'with github.com URL without protocol' do
      it 'adds https protocol' do
        scraper = described_class.new('github.com/testuser')
        expect(scraper.instance_variable_get(:@url)).to eq('https://github.com/testuser')
        expect(scraper.instance_variable_get(:@username)).to eq('testuser')
      end
    end

    context 'with username only' do
      it 'adds full GitHub URL' do
        scraper = described_class.new('testuser')
        expect(scraper.instance_variable_get(:@url)).to eq('https://github.com/testuser')
        expect(scraper.instance_variable_get(:@username)).to eq('testuser')
      end
    end

    context 'with invalid URL' do
      it 'normalizes invalid URL and treats it as username' do
        scraper = described_class.new('invalid-url')
        expect(scraper.instance_variable_get(:@url)).to eq('https://github.com/invalid-url')
        expect(scraper.instance_variable_get(:@username)).to eq('invalid-url')
      end
    end
  end

  describe '#run' do
    let(:profile_url) { 'https://github.com/testuser' }
    let(:contributions_url) { 'https://github.com/testuser?action=show&controller=profiles&tab=contributions&user_id=testuser' }
    let(:profile_html) do
      <<~HTML
        <html>
          <body>
            <span class="p-name">Test User</span>
            <img class="avatar" src="https://avatars.githubusercontent.com/u/123?v=4" alt="@testuser" />
            <a href="/testuser?tab=followers"><span>100</span> followers</a>
            <a href="/testuser?tab=following"><span>50</span> following</a>
            <a href="/testuser?tab=stars"><span>200</span> stars</a>
            <a href="/testuser?tab=repositories"><span class="Counter">30</span> repositories</a>
            <li itemprop="homeLocation"><span>San Francisco, CA</span></li>
            <a data-hovercard-type="organization" href="/org1">Org 1</a>
            <a data-hovercard-type="organization" href="/org2">Org 2</a>
          </body>
        </html>
      HTML
    end
    let(:contributions_html) do
      <<~HTML
        <html>
          <body>
            <h2 id="js-contribution-activity-description">1,234 contributions in the last year</h2>
          </body>
        </html>
      HTML
    end

    let(:profile_response) { instance_double(HTTParty::Response, success?: true, body: profile_html, code: 200) }
    let(:contributions_response) { instance_double(HTTParty::Response, success?: true, body: contributions_html, code: 200) }

    before do
      allow(HTTParty).to receive(:get).with(profile_url).and_return(profile_response)
      allow(HTTParty).to receive(:get).with(profile_url, anything).and_return(profile_response)
      allow(HTTParty).to receive(:get).with(contributions_url, hash_including(:headers)).and_return(contributions_response)
    end

    context 'when scraping is successful' do
      it 'returns profile data with all fields' do
        scraper = described_class.new(profile_url)
        result = scraper.run

        expect(result).to include(
          username: 'testuser',
          name: 'Test User',
          avatar_url: 'https://avatars.githubusercontent.com/u/123?v=4',
          followers_count: 100,
          following_count: 50,
          starts_count: 200,
          public_repos_count: 30,
          total_contributions_last_year: 1234,
          organizations: ['org1', 'org2'],
          location: 'San Francisco, CA',
          url: profile_url
        )
      end

      it 'calls HTTParty.get for profile page' do
        scraper = described_class.new(profile_url)
        scraper.run

        expect(HTTParty).to have_received(:get).with(profile_url)
      end

      it 'calls HTTParty.get for contributions page' do
        scraper = described_class.new(profile_url)
        scraper.run

        expect(HTTParty).to have_received(:get).with(contributions_url, hash_including(:headers))
      end
    end

    context 'when profile page request fails' do
      let(:failed_response) { instance_double(HTTParty::Response, success?: false, code: 404) }

      before do
        allow(HTTParty).to receive(:get).with(profile_url).and_return(failed_response)
        allow(HTTParty).to receive(:get).with(profile_url, anything).and_return(failed_response)
      end

      it 'raises an error with status code' do
        scraper = described_class.new(profile_url)

        expect {
          scraper.run
        }.to raise_error('Failed to fetch profile: 404')
      end
    end

    context 'when contributions page request fails' do
      let(:failed_contributions_response) { instance_double(HTTParty::Response, success?: false, code: 500) }

      before do
        allow(HTTParty).to receive(:get).with(contributions_url, hash_including(:headers)).and_return(failed_contributions_response)
      end

      it 'returns 0 for contributions and continues' do
        scraper = described_class.new(profile_url)
        result = scraper.run

        expect(result[:total_contributions_last_year]).to eq(0)
      end
    end

    context 'when contributions page raises an error' do
      before do
        allow(HTTParty).to receive(:get).with(contributions_url, hash_including(:headers)).and_raise(StandardError.new('Network error'))
        allow(Rails.logger).to receive(:error)
      end

      it 'returns 0 for contributions and logs error' do
        scraper = described_class.new(profile_url)
        result = scraper.run

        expect(result[:total_contributions_last_year]).to eq(0)
        expect(Rails.logger).to have_received(:error).with(/Failed to fetch contributions from turbo-frame/)
      end
    end

    context 'when name is missing' do
      let(:html_without_name) do
        <<~HTML
          <html>
            <body>
              <img class="avatar" src="https://avatars.githubusercontent.com/u/123?v=4" />
            </body>
          </html>
        HTML
      end
      let(:response_without_name) { instance_double(HTTParty::Response, success?: true, body: html_without_name, code: 200) }

      before do
        allow(HTTParty).to receive(:get).with(profile_url).and_return(response_without_name)
        allow(HTTParty).to receive(:get).with(profile_url, anything).and_return(response_without_name)
        allow(HTTParty).to receive(:get).with(contributions_url, hash_including(:headers)).and_return(contributions_response)
      end

      it 'uses username as name' do
        scraper = described_class.new(profile_url)
        result = scraper.run

        expect(result[:name]).to eq('testuser')
      end
    end

    context 'when avatar URL is relative' do
      let(:html_with_relative_avatar) do
        <<~HTML
          <html>
            <body>
              <span class="p-name">Test User</span>
              <img class="avatar" src="//avatars.githubusercontent.com/u/123?v=4" />
            </body>
          </html>
        HTML
      end
      let(:response_with_relative_avatar) { instance_double(HTTParty::Response, success?: true, body: html_with_relative_avatar, code: 200) }

      before do
        allow(HTTParty).to receive(:get).with(profile_url).and_return(response_with_relative_avatar)
        allow(HTTParty).to receive(:get).with(profile_url, anything).and_return(response_with_relative_avatar)
        allow(HTTParty).to receive(:get).with(contributions_url, hash_including(:headers)).and_return(contributions_response)
      end

      it 'normalizes protocol-relative URL' do
        scraper = described_class.new(profile_url)
        result = scraper.run

        expect(result[:avatar_url]).to eq('https://avatars.githubusercontent.com/u/123?v=4')
      end
    end

    context 'when avatar URL is path-relative' do
      let(:html_with_path_avatar) do
        <<~HTML
          <html>
            <body>
              <span class="p-name">Test User</span>
              <img class="avatar" src="/avatars/u/123?v=4" />
            </body>
          </html>
        HTML
      end
      let(:response_with_path_avatar) { instance_double(HTTParty::Response, success?: true, body: html_with_path_avatar, code: 200) }

      before do
        allow(HTTParty).to receive(:get).with(profile_url).and_return(response_with_path_avatar)
        allow(HTTParty).to receive(:get).with(profile_url, anything).and_return(response_with_path_avatar)
        allow(HTTParty).to receive(:get).with(contributions_url, hash_including(:headers)).and_return(contributions_response)
      end

      it 'normalizes path-relative URL' do
        scraper = described_class.new(profile_url)
        result = scraper.run

        expect(result[:avatar_url]).to eq('https://github.com/avatars/u/123?v=4')
      end
    end

    context 'when followers count is missing' do
      let(:html_without_followers) do
        <<~HTML
          <html>
            <body>
              <span class="p-name">Test User</span>
            </body>
          </html>
        HTML
      end
      let(:response_without_followers) { instance_double(HTTParty::Response, success?: true, body: html_without_followers, code: 200) }

      before do
        allow(HTTParty).to receive(:get).with(profile_url).and_return(response_without_followers)
        allow(HTTParty).to receive(:get).with(profile_url, anything).and_return(response_without_followers)
        allow(HTTParty).to receive(:get).with(contributions_url, hash_including(:headers)).and_return(contributions_response)
      end

      it 'returns 0 for followers count' do
        scraper = described_class.new(profile_url)
        result = scraper.run

        expect(result[:followers_count]).to eq(0)
      end
    end

    context 'when followers count has k suffix' do
      let(:html_with_k_followers) do
        <<~HTML
          <html>
            <body>
              <span class="p-name">Test User</span>
              <a href="/testuser?tab=followers">1.5k followers</a>
            </body>
          </html>
        HTML
      end
      let(:response_with_k_followers) { instance_double(HTTParty::Response, success?: true, body: html_with_k_followers, code: 200) }

      before do
        allow(HTTParty).to receive(:get).with(profile_url).and_return(response_with_k_followers)
        allow(HTTParty).to receive(:get).with(profile_url, anything).and_return(response_with_k_followers)
        allow(HTTParty).to receive(:get).with(contributions_url, hash_including(:headers)).and_return(contributions_response)
      end

      it 'converts k to thousands' do
        scraper = described_class.new(profile_url)
        result = scraper.run

        expect(result[:followers_count]).to eq(1500)
      end
    end

    context 'when followers count has m suffix' do
      let(:html_with_m_followers) do
        <<~HTML
          <html>
            <body>
              <span class="p-name">Test User</span>
              <a href="/testuser?tab=followers">2.5m followers</a>
            </body>
          </html>
        HTML
      end
      let(:response_with_m_followers) { instance_double(HTTParty::Response, success?: true, body: html_with_m_followers, code: 200) }

      before do
        allow(HTTParty).to receive(:get).with(profile_url).and_return(response_with_m_followers)
        allow(HTTParty).to receive(:get).with(profile_url, anything).and_return(response_with_m_followers)
        allow(HTTParty).to receive(:get).with(contributions_url, hash_including(:headers)).and_return(contributions_response)
      end

      it 'converts m to millions' do
        scraper = described_class.new(profile_url)
        result = scraper.run

        expect(result[:followers_count]).to eq(2_500_000)
      end
    end

    context 'when stars count is found via alternative method' do
      let(:html_with_stars_alt) do
        <<~HTML
          <html>
            <body>
              <span class="p-name">Test User</span>
              <div class="js-profile-editable-replace">
                <div class="text-bold">500 stars</div>
              </div>
            </body>
          </html>
        HTML
      end
      let(:response_with_stars_alt) { instance_double(HTTParty::Response, success?: true, body: html_with_stars_alt, code: 200) }

      before do
        allow(HTTParty).to receive(:get).with(profile_url).and_return(response_with_stars_alt)
        allow(HTTParty).to receive(:get).with(profile_url, anything).and_return(response_with_stars_alt)
        allow(HTTParty).to receive(:get).with(contributions_url, hash_including(:headers)).and_return(contributions_response)
      end

      it 'extracts stars count from alternative location' do
        scraper = described_class.new(profile_url)
        result = scraper.run

        expect(result[:starts_count]).to eq(500)
      end
    end

    context 'when organizations are found via avatar-group-item' do
      let(:html_with_org_avatars) do
        <<~HTML
          <html>
            <body>
              <span class="p-name">Test User</span>
              <a class="avatar-group-item" href="/org1">Org 1</a>
              <a class="avatar-group-item" href="/org2">Org 2</a>
            </body>
          </html>
        HTML
      end
      let(:response_with_org_avatars) { instance_double(HTTParty::Response, success?: true, body: html_with_org_avatars, code: 200) }

      before do
        allow(HTTParty).to receive(:get).with(profile_url).and_return(response_with_org_avatars)
        allow(HTTParty).to receive(:get).with(profile_url, anything).and_return(response_with_org_avatars)
        allow(HTTParty).to receive(:get).with(contributions_url, hash_including(:headers)).and_return(contributions_response)
      end

      it 'extracts organizations from avatar-group-item links' do
        scraper = described_class.new(profile_url)
        result = scraper.run

        expect(result[:organizations]).to contain_exactly('org1', 'org2')
      end
    end

    context 'when organizations are found via /orgs/ links' do
      let(:html_with_orgs_links) do
        <<~HTML
          <html>
            <body>
              <span class="p-name">Test User</span>
              <a href="/orgs/org1">Org 1</a>
              <a href="/orgs/org2">Org 2</a>
            </body>
          </html>
        HTML
      end
      let(:response_with_orgs_links) { instance_double(HTTParty::Response, success?: true, body: html_with_orgs_links, code: 200) }

      before do
        allow(HTTParty).to receive(:get).with(profile_url).and_return(response_with_orgs_links)
        allow(HTTParty).to receive(:get).with(profile_url, anything).and_return(response_with_orgs_links)
        allow(HTTParty).to receive(:get).with(contributions_url, hash_including(:headers)).and_return(contributions_response)
      end

      it 'extracts organizations from /orgs/ links' do
        scraper = described_class.new(profile_url)
        result = scraper.run

        expect(result[:organizations]).to contain_exactly('org1', 'org2')
      end
    end

    context 'when location is found via vcard-detail' do
      let(:html_with_vcard_location) do
        <<~HTML
          <html>
            <body>
              <span class="p-name">Test User</span>
              <li class="vcard-detail">
                <svg class="octicon-location"></svg>
                <span>New York, NY</span>
              </li>
            </body>
          </html>
        HTML
      end
      let(:response_with_vcard_location) { instance_double(HTTParty::Response, success?: true, body: html_with_vcard_location, code: 200) }

      before do
        allow(HTTParty).to receive(:get).with(profile_url).and_return(response_with_vcard_location)
        allow(HTTParty).to receive(:get).with(profile_url, anything).and_return(response_with_vcard_location)
        allow(HTTParty).to receive(:get).with(contributions_url, hash_including(:headers)).and_return(contributions_response)
      end

      it 'extracts location from vcard-detail' do
        scraper = described_class.new(profile_url)
        result = scraper.run

        expect(result[:location]).to eq('New York, NY')
      end
    end

    context 'when contributions text has commas' do
      let(:contributions_html_with_commas) do
        <<~HTML
          <html>
            <body>
              <h2 id="js-contribution-activity-description">1,234,567 contributions in the last year</h2>
            </body>
          </html>
        HTML
      end
      let(:contributions_response_with_commas) { instance_double(HTTParty::Response, success?: true, body: contributions_html_with_commas, code: 200) }

      before do
        allow(HTTParty).to receive(:get).with(contributions_url, hash_including(:headers)).and_return(contributions_response_with_commas)
      end

      it 'removes commas from contributions count' do
        scraper = described_class.new(profile_url)
        result = scraper.run

        expect(result[:total_contributions_last_year]).to eq(1_234_567)
      end
    end

    context 'when contributions text is found in alternative heading' do
      let(:contributions_html_alt) do
        <<~HTML
          <html>
            <body>
              <h3>User made 999 contributions last year</h3>
            </body>
          </html>
        HTML
      end
      let(:contributions_response_alt) { instance_double(HTTParty::Response, success?: true, body: contributions_html_alt, code: 200) }

      before do
        allow(HTTParty).to receive(:get).with(contributions_url, hash_including(:headers)).and_return(contributions_response_alt)
      end

      it 'extracts contributions from alternative heading' do
        scraper = described_class.new(profile_url)
        result = scraper.run

        expect(result[:total_contributions_last_year]).to eq(999)
      end
    end

    context 'when contributions text is empty' do
      let(:contributions_html_empty) do
        <<~HTML
          <html>
            <body>
              <h2></h2>
            </body>
          </html>
        HTML
      end
      let(:contributions_response_empty) { instance_double(HTTParty::Response, success?: true, body: contributions_html_empty, code: 200) }

      before do
        allow(HTTParty).to receive(:get).with(contributions_url, hash_including(:headers)).and_return(contributions_response_empty)
      end

      it 'returns 0 for contributions' do
        scraper = described_class.new(profile_url)
        result = scraper.run

        expect(result[:total_contributions_last_year]).to eq(0)
      end
    end

    context 'when organizations exclude username' do
      let(:html_with_username_as_org) do
        <<~HTML
          <html>
            <body>
              <span class="p-name">Test User</span>
              <a data-hovercard-type="organization" href="/testuser">Test User</a>
              <a data-hovercard-type="organization" href="/org1">Org 1</a>
            </body>
          </html>
        HTML
      end
      let(:response_with_username_as_org) { instance_double(HTTParty::Response, success?: true, body: html_with_username_as_org, code: 200) }

      before do
        allow(HTTParty).to receive(:get).with(profile_url).and_return(response_with_username_as_org)
        allow(HTTParty).to receive(:get).with(profile_url, anything).and_return(response_with_username_as_org)
        allow(HTTParty).to receive(:get).with(contributions_url, hash_including(:headers)).and_return(contributions_response)
      end

      it 'excludes username from organizations' do
        scraper = described_class.new(profile_url)
        result = scraper.run

        expect(result[:organizations]).to eq(['org1'])
        expect(result[:organizations]).not_to include('testuser')
      end
    end

    context 'when organizations are deduplicated' do
      let(:html_with_duplicate_orgs) do
        <<~HTML
          <html>
            <body>
              <span class="p-name">Test User</span>
              <a data-hovercard-type="organization" href="/org1">Org 1</a>
              <a class="avatar-group-item" href="/org1">Org 1</a>
              <a href="/orgs/org1">Org 1</a>
            </body>
          </html>
        HTML
      end
      let(:response_with_duplicate_orgs) { instance_double(HTTParty::Response, success?: true, body: html_with_duplicate_orgs, code: 200) }

      before do
        allow(HTTParty).to receive(:get).with(profile_url).and_return(response_with_duplicate_orgs)
        allow(HTTParty).to receive(:get).with(profile_url, anything).and_return(response_with_duplicate_orgs)
        allow(HTTParty).to receive(:get).with(contributions_url, hash_including(:headers)).and_return(contributions_response)
      end

      it 'removes duplicate organizations' do
        scraper = described_class.new(profile_url)
        result = scraper.run

        expect(result[:organizations]).to eq(['org1'])
      end
    end
  end
end

