require "httparty"
require "nokogiri"

module Github
  class ScrapeProfile
    def initialize(url)
      @url = normalize_url(url)
      @username = extract_username_from_url(@url)
    end

    def scrape
      response = HTTParty.get(@url, headers: {
        "User-Agent" => "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      })

      raise "Failed to fetch profile: #{response.code}" unless response.success?

      doc = Nokogiri::HTML(response.body)

      {
        username: @username,
        name: extract_name(doc),
        avatar_url: extract_avatar_url(doc),
        followers_count: extract_followers_count(doc),
        following_count: extract_following_count(doc),
        starts_count: extract_stars_count(doc),
        total_contributions_last_year: extract_contributions_last_year(doc),
        organization: extract_organization(doc),
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

    def extract_contributions_last_year(doc)
      contributions_text = doc.at_css("h2.f4.text-normal.mb-2")&.text ||
                          doc.at_css(".js-yearly-contributions h2")&.text ||
                          doc.css("h2").find { |h2| h2.text.downcase.include?("contribution") }&.text

      if contributions_text
        match = contributions_text.match(/([\d,]+)\s+contribution/i)
        return match[1].gsub(",", "").to_i if match
      end

      contribution_graph = doc.at_css(".js-calendar-graph") || doc.at_css("[data-view-component='true']")
      if contribution_graph
        contribution_days = contribution_graph.css("rect[data-count]") || contribution_graph.css("[data-count]")
        total = contribution_days.sum { |rect| rect["data-count"].to_i }
        return total if total > 0
      end

      summary_text = doc.css("div").find { |div| div.text.downcase.include?("contribution") }&.text
      if summary_text
        match = summary_text.match(/([\d,]+)\s+contribution/i)
        return match[1].gsub(",", "").to_i if match
      end

      0
    end

    def extract_organization(doc)
      org_element = doc.at_css("[itemprop='worksFor']") ||
                    doc.css(".p-org").first ||
                    doc.css(".vcard-detail").find { |el| el.text.include?("Organization") }

      org_element&.text&.strip
    end

    def extract_location(doc)
      location_element = doc.at_css("[itemprop='homeLocation']") ||
                         doc.at_css(".p-label") ||
                         doc.css(".vcard-detail").find { |el| el.text.match?(/📍|location/i) }

      location_element&.text&.strip&.gsub(/📍\s*/, "")
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