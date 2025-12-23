require 'rails_helper'

RSpec.describe 'Members', type: :request do
  describe 'GET /members' do
    context 'when members exist' do
      let!(:member1) { create(:member) }
      let!(:member2) { create(:member) }

      it 'returns all members' do
        get '/members'

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response).to be_an(Array)
        member_ids = json_response.map { |m| m['id'] }
        expect(member_ids).to include(member1.id, member2.id)
      end
    end

    context 'when no members exist' do
      before do
        Member.delete_all
      end

      it 'returns an empty array' do
        get '/members'

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response).to eq([])
      end
    end
  end

  describe 'GET /members/:id' do
    context 'when member exists' do
      let(:member) { create(:member) }

      it 'returns the member' do
        get "/members/#{member.id}"

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['id']).to eq(member.id)
        expect(json_response['name']).to eq(member.name)
        expect(json_response['url']).to eq(member.url)
      end
    end

    context 'when member does not exist' do
      it 'returns 404' do
        get '/members/999999'

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'POST /members' do
    context 'with valid parameters' do
      let(:valid_params) do
        {
          member: {
            name: 'John Doe',
            url: 'https://github.com/johndoe'
          }
        }
      end

      it 'creates a new member' do
        expect {
          post '/members', params: valid_params
        }.to change(Member, :count).by(1)

        expect(response).to have_http_status(:created)
        json_response = JSON.parse(response.body)
        expect(json_response['name']).to eq('John Doe')
        expect(json_response['url']).to eq('https://github.com/johndoe')
        expect(json_response['scraping_status']).to eq('pending')
      end

      it 'enqueues ScrapeGithubProfileJob when url is present' do
        allow(ScrapeGithubProfileJob).to receive(:perform_later)

        post '/members', params: valid_params

        expect(ScrapeGithubProfileJob).to have_received(:perform_later).once
        member = Member.last
        expect(ScrapeGithubProfileJob).to have_received(:perform_later).with(member.id)
      end

      context 'when url is empty string' do
        let(:params_with_empty_url) do
          {
            member: {
              name: 'Jane Doe',
              url: ''
            }
          }
        end

        it 'does not create a member and returns validation error' do
          allow(ScrapeGithubProfileJob).to receive(:perform_later)

          expect {
            post '/members', params: params_with_empty_url
          }.not_to change(Member, :count)

          expect(ScrapeGithubProfileJob).not_to have_received(:perform_later)
          expect(response).to have_http_status(:unprocessable_entity)
          json_response = JSON.parse(response.body)
          expect(json_response['error']).to eq('Validation failed')
          expect(json_response['messages']).to include("Url can't be blank")
        end
      end
    end

    context 'with invalid parameters' do
      context 'when name is missing' do
        let(:invalid_params) do
          {
            member: {
              url: 'https://github.com/test'
            }
          }
        end

        it 'does not create a member and returns validation error' do
          expect {
            post '/members', params: invalid_params
          }.not_to change(Member, :count)

          expect(response).to have_http_status(:unprocessable_entity)
          json_response = JSON.parse(response.body)
          expect(json_response['error']).to eq('Validation failed')
          expect(json_response['messages']).to include("Name can't be blank")
        end
      end

      context 'when url is missing' do
        let(:invalid_params) do
          {
            member: {
              name: 'Test User'
            }
          }
        end

        let(:json_response) { JSON.parse(response.body) }

        before do
          post '/members', params: invalid_params
        end

        it 'does not create a member and returns validation error' do
          expect(response).to have_http_status(:unprocessable_entity)
          expect(json_response['error']).to eq('Validation failed')
          expect(json_response['messages']).to include("Url can't be blank")
        end
      end

      context 'when member parameter is missing' do
        it 'returns bad request error' do
          post '/members', params: {}
          expect(response).to have_http_status(:bad_request)
          expect(JSON.parse(response.body)['error']).to eq('Parameter missing')
        end
      end

      context 'when unexpected fields are provided' do
        let(:params_with_extra_fields) do
          {
            member: {
              name: 'Test User',
              url: 'https://github.com/test',
              email: 'test@example.com',
              age: 25
            }
          }
        end

        before do
          post '/members', params: params_with_extra_fields
        end

        it 'ignores unexpected fields when creating a member' do
          expect(response).to have_http_status(:created)
          expect(JSON.parse(response.body)['name']).to eq('Test User')
          expect(JSON.parse(response.body)['url']).to eq('https://github.com/test')
        end

        it 'does not include unexpected fields in the response' do
          expect(JSON.parse(response.body)['email']).to be_nil
          expect(JSON.parse(response.body)['age']).to be_nil
        end
      end
    end
  end

  describe 'PUT /members/:id' do
    let(:member) { create(:member, name: 'Original Name', url: 'https://github.com/original') }
    
    before do
      allow(ScrapeGithubProfileJob).to receive(:perform_later)
    end

    context 'with valid parameters' do
      let(:update_params) do
        {
          member: {
            name: 'Updated Name',
            url: 'https://github.com/updated'
          }
        }
      end

      before do
        put "/members/#{member.id}", params: update_params
      end

      it 'updates the member' do
        expect(response).to have_http_status(:created)
        expect(member.reload.name).to eq('Updated Name')
        expect(member.reload.url).to eq('https://github.com/updated')
      end

      it 'enqueues ScrapeGithubProfileJob when url is present' do
        expect(ScrapeGithubProfileJob).to have_received(:perform_later).once
        expect(ScrapeGithubProfileJob).to have_received(:perform_later).with(member.id)
      end

      context 'when url is set to empty string' do
        let(:update_params_with_empty_url) do
          {
            member: {
              name: 'Updated Name',
              url: ''
            }
          }
        end

        before do
          RSpec::Mocks.space.proxy_for(ScrapeGithubProfileJob).reset if RSpec::Mocks.space.proxy_for(ScrapeGithubProfileJob)
          
          allow(ScrapeGithubProfileJob).to receive(:perform_later)
          
          put "/members/#{member.id}", params: update_params_with_empty_url
        end

        it 'does not enqueue ScrapeGithubProfileJob when url is empty' do
          expect(ScrapeGithubProfileJob).not_to have_received(:perform_later)
        end

        it 'returns validation error when url is empty' do
          expect(response).to have_http_status(:unprocessable_entity)
          expect(JSON.parse(response.body)['error']).to eq('Validation failed')
          expect(JSON.parse(response.body)['messages']).to include("Url can't be blank")
        end

        it 'does not update the member when url is empty' do
          expect(member.reload.url).to eq(member.url)
          expect(member.reload.name).to eq(member.name)
        end
      end
    end

    context 'with invalid parameters' do
      context 'when name is set to empty string' do
        let(:invalid_params) do
          {
            member: {
              name: '',
              url: member.url
            }
          }
        end

        before do
          put "/members/#{member.id}", params: invalid_params
        end

        it 'returns validation error when name is empty' do
          expect(response).to have_http_status(:unprocessable_entity)
          expect(JSON.parse(response.body)['error']).to eq('Validation failed')
          expect(JSON.parse(response.body)['messages']).to include("Name can't be blank")
        end

        it 'does not update the member when name is empty' do
          expect(member.reload.name).to eq(member.name)
        end
      end

      context 'when unexpected fields are provided' do
        let(:params_with_extra_fields) do
          {
            member: {
              name: 'Updated Name',
              url: member.url,
              email: 'test@example.com'
            }
          }
        end

        before do
          put "/members/#{member.id}", params: params_with_extra_fields
        end

        it 'returns success and updates only valid attributes' do
          expect(response).to have_http_status(:created)
        end

        it 'updates name and keeps url unchanged' do
          expect(JSON.parse(response.body)['name']).to eq('Updated Name')
          expect(JSON.parse(response.body)['url']).to eq(member.url)
        end

        it 'does not include unexpected fields in the response' do
          expect(JSON.parse(response.body)['email']).to be_nil
        end

        it 'persists the name change but not unexpected fields' do
          expect(member.reload.name).to eq('Updated Name')
        end

      end
    end

    context 'when member does not exist' do
      it 'returns 404' do
        put '/members/999999', params: { member: { name: 'Test' } }

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'DELETE /members/:id' do
    context 'when member exists' do
      let!(:member) { create(:member) }

      before do
        delete "/members/#{member.id}"
      end

      it 'deletes the member' do
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)['message']).to eq('Member deleted successfully')
      end
    end

    context 'when member does not exist' do

      before do
        delete '/members/999999'
      end
      
      it 'returns 404' do
        delete '/members/999999'

        expect(response).to have_http_status(:not_found)
      end
    end
  end
end

