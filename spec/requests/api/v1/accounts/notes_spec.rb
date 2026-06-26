# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Accounts Notes API' do
  include_context 'with API authentication', oauth_scopes: 'write:accounts'

  let(:account) { Fabricate(:account) }
  let(:comment) { 'foo' }

  describe 'POST /api/v1/accounts/:account_id/note' do
    subject do
      post "/api/v1/accounts/#{account.id}/note", params: { comment: comment }, headers: headers
    end

    context 'when account note has reasonable length', :aggregate_failures do
      let(:comment) { 'foo' }

      it 'updates account note' do
        subject

        expect(response).to have_http_status(200)
        expect(response.content_type)
          .to start_with('application/json')
        expect(AccountNote.find_by(account_id: user.account.id, target_account_id: account.id).comment).to eq comment
        expect(response.parsed_body['note_all_emojis']).to eq([])
        expect(response.parsed_body['note_formatted']).to eq('<p>foo</p>')
      end
    end

    context 'when account note contains animation syntax', :aggregate_failures do
      let(:profile_account) { Fabricate(:account) }
      let(:comment) { "[[[ :@#{profile_account.username}: ]]]" }

      it 'returns note_formatted with animation markup in the response' do
        subject

        expect(response).to have_http_status(200)
        expect(response.parsed_body['note']).to eq comment
        expect(response.parsed_body['note_formatted']).to include('<span class="spin">')
        expect(response.parsed_body['note_formatted']).to include(":@#{profile_account.username}:")
      end
    end

    context 'when account note contains a profile emoji', :aggregate_failures do
      let(:profile_account) { Fabricate(:account) }
      let(:comment) { "hello :@#{profile_account.username}:" }

      it 'returns note_all_emojis in the response' do
        subject

        expect(response).to have_http_status(200)
        expect(response.parsed_body['note']).to eq comment
        expect(response.parsed_body['note_all_emojis']).to contain_exactly(
          include(
            'shortcode' => "@#{profile_account.username}",
            'account_id' => profile_account.id.to_s
          )
        )
      end
    end

    context 'when account note exceeds allowed length', :aggregate_failures do
      let(:comment) { 'a' * AccountNote::COMMENT_SIZE_LIMIT * 2 }

      it 'does not create account note' do
        subject

        expect(response).to have_http_status(422)
        expect(response.content_type)
          .to start_with('application/json')
        expect(AccountNote.where(account_id: user.account.id, target_account_id: account.id)).to_not exist
      end
    end
  end
end
