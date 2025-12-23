require 'rails_helper'

RSpec.describe 'ShortUrls', type: :request do
  describe 'GET /:short_code' do
    let(:sqids) { Sqids.new(min_length: 6) }

    context 'when short_code is valid and member exists' do
      let(:member) { create(:member, url: 'https://github.com/testuser') }
      let(:short_code) { sqids.encode([member.id]) }

      it 'redirects to the member URL' do
        get "/#{short_code}"

        expect(response).to have_http_status(:redirect)
        expect(response).to redirect_to(member.url)
      end
    end

    context 'when short_code is invalid (cannot be decoded)' do
      let(:invalid_short_code) { 'invalid' }

      it 'returns 404 with error message' do
        get "/#{invalid_short_code}"

        expect(response).to have_http_status(:not_found)
        expect(JSON.parse(response.body)).to eq({ 'error' => 'invalid URL' })
      end
    end

    context 'when short_code is valid but member does not exist' do
      let(:non_existent_id) { 999_999 }
      let(:short_code) { sqids.encode([non_existent_id]) }

      it 'returns 404 with error message' do
        get "/#{short_code}"

        expect(response).to have_http_status(:not_found)
        expect(JSON.parse(response.body)).to eq({ 'error' => 'invalid URL' })
      end
    end
  end
end
