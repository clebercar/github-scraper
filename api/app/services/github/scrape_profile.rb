require "httparty"
require "nokogiri"

module Github
  class ScrapeProfile
    def initialize(url)
      @url = normalize_url(url)
      @username = extract_username_from_url(@url)
    end

    def run
      response = HTTParty.get(@url)

      raise "Failed to fetch profile: #{response.code}" unless response.success?

      doc = Nokogiri::HTML(response.body)

      {
        username: @username,
        name: extract_name(doc),
        avatar_url: extract_avatar_url(doc),
        followers_count: extract_followers_count(doc),
        following_count: extract_following_count(doc),
        starts_count: extract_stars_count(doc),
        public_repos_count: extract_public_repos_count(doc),
        total_contributions_last_year: extract_contributions_last_year,
        organizations: extract_organizations(doc),
        location: extract_location(doc),
        url: @url
      }
    end

    private

    def normalize_url(url)      
      return url if url.match?(%r{^https?://})
      
      return "https://#{url}" if url.match?(%r{^github\.com/})

      "https://github.com/#{url}"
    end

    def extract_username_from_url(url)
      match = url.match(%r{github\.com/([^/?#]+)})
      raise "Invalid GitHub URL: #{url}" unless match

      match[1]
    end

    def extract_name(doc)
      name_element = doc.at_css("span.p-name") || doc.at_css("h1.vcard-names .p-name") || doc.at_css("[itemprop='name']")
      name = name_element&.text&.strip

      name.presence || @username
    end

    def extract_avatar_url(doc)
      avatar = doc.at_css("img.avatar") || doc.at_css("img[alt='@#{@username}']") || doc.at_css("[itemprop='image']")
      avatar_url = avatar&.[]("src") || avatar&.[]("data-src")

      if avatar_url&.start_with?("//")
        "https:#{avatar_url}"
      elsif avatar_url&.start_with?("/")
        "https://github.com#{avatar_url}"
      else
        avatar_url
      end
    end

    def extract_followers_count(doc)
      followers_link = doc.at_css("a[href='/#{@username}?tab=followers']") ||
                       doc.at_css("a[href*='tab=followers']") ||
                       doc.css("a").find { |a| a["href"]&.include?("tab=followers") }
      
      if followers_link
        text = followers_link.text.strip
        number_element = followers_link.at_css("span") || followers_link
        text = number_element.text.strip if number_element
        
        extract_number_from_text(text)
      else
        0
      end
    end

    def extract_following_count(doc)
      following_link = doc.at_css("a[href='/#{@username}?tab=following']") ||
                       doc.at_css("a[href*='tab=following']") ||
                       doc.css("a").find { |a| a["href"]&.include?("tab=following") }
      
      if following_link
        text = following_link.text.strip
        number_element = following_link.at_css("span") || following_link
        text = number_element.text.strip if number_element
        
        extract_number_from_text(text)
      else
        0
      end
    end

    def extract_stars_count(doc)
      stars_link = doc.at_css("a[href='/#{@username}?tab=stars']") ||
                   doc.at_css("a[href*='tab=stars']") ||
                   doc.css("a").find { |a| a["href"]&.include?("tab=stars") }

      if stars_link
        text = stars_link.text.strip
        number_element = stars_link.at_css("span") || stars_link
        text = number_element.text.strip if number_element

        extract_number_from_text(text)
      else
        stats = doc.css(".js-profile-editable-replace .text-bold")
        stats.each do |stat|
          if stat.parent&.text&.downcase&.include?("star")
            return extract_number_from_text(stat.text)
          end
        end
        0
      end
    end

    def extract_public_repos_count(doc)
      repos_link = doc.at_css("a[href='/#{@username}?tab=repositories']") ||
                   doc.at_css("a[href*='tab=repositories']") ||
                   doc.css("a").find { |a| a["href"]&.include?("tab=repositories") }

      if repos_link
        counter = repos_link.at_css(".Counter") || repos_link.at_css("span")
        text = counter&.text&.strip || repos_link.text.strip
        extract_number_from_text(text)
      else
        0
      end
    end

    def extract_contributions_last_year
      contributions_text = fetch_contributions_from_turbo_frame

      return 0 unless contributions_text && !contributions_text.empty?

      match = contributions_text.match(/(\d[\d,]*)/)

      match ? match[1].gsub(",", "").to_i : 0
    end

    def fetch_contributions_from_turbo_frame
      contributions_url = "https://github.com/#{@username}?action=show&controller=profiles&tab=contributions&user_id=#{@username}"
      
      begin
        response = HTTParty.get(
          contributions_url,
          headers: github_request_headers
        )
        
        return nil unless response.success?
        
        contributions_doc = Nokogiri::HTML(response.body)
        contributions_text = contributions_doc.at_css("h2#js-contribution-activity-description")&.text ||
                            contributions_doc.at_css("h2")&.text
        
        if contributions_text.nil? || contributions_text.empty?
          contributions_doc.css("h2, h3").each do |heading|
            text = heading.text
            if text.match?(/contribution/i) && text.match?(/\d/)
              contributions_text = text
              break
            end
          end
        end
        
        contributions_text
      rescue StandardError => e
        Rails.logger.error("Failed to fetch contributions from turbo-frame: #{e.message}") if defined?(Rails)
        nil
      end
    end

    def github_request_headers
      nonce = "v2:#{SecureRandom.uuid}"
      {
        "accept" => "text/html",
        "user-agent" => "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
        "x-requested-with" => "XMLHttpRequest",
        "referer" => "https://github.com/#{@username}",
        "x-fetch-nonce" => nonce,
        "x-fetch-nonce-to-validate" => nonce,
        "x-github-client-version" => "ecad3eec465beddbe739bccfec4334bdfea35cc3"
      }
    end

    def extract_organizations(doc)
      organizations = []

      org_links = doc.css("a[data-hovercard-type='organization']")
      org_links.each do |link|
        href = link["href"]
        next unless href.present?

        org_name = href.gsub(%r{^/(orgs/)?}, "").strip
        next if org_name.empty? || org_name == @username

        organizations << org_name
      end

      if organizations.empty?
        doc.css("a.avatar-group-item").each do |link|
          href = link["href"]
          next unless href.present?

          if href.match?(%r{^/[^/]+$}) && !href.start_with?("/#{@username}")
            org_name = href.gsub(%r{^/}, "").strip
            organizations << org_name if org_name.present? && org_name != @username
          end
        end
      end

      doc.css("a[href^='/orgs/']").each do |link|
        href = link["href"]
        next unless href.present?

        org_name = href.gsub(%r{^/orgs/}, "").split("/").first&.strip
        organizations << org_name if org_name.present? && org_name != @username
      end

      organizations.uniq.compact
    end

    def extract_location(doc)
      location_item = doc.at_css("li[itemprop='homeLocation']") ||
                      doc.css(".vcard-detail").find { |el| el.at_css("svg.octicon-location") }

      return location_item.at_css("span")&.text&.strip if location_item

      location_element = doc.at_css("[itemprop='homeLocation'] span") ||
                         doc.at_css(".p-label")

      location_element&.text&.strip
    end

    def extract_number_from_text(text)
      text = text.gsub(/,/, "").strip

      if text.match?(/k/i)
        (text.to_f * 1000).to_i
      elsif text.match?(/m/i)
        (text.to_f * 1_000_000).to_i
      else
        text.scan(/\d+/).first&.to_i || 0
      end
    end
  end
end