# frozen_string_literal: true

require 'rails_helper'

RSpec.describe REST::RelationshipSerializer do
  subject do
    serialized_record_json(
      target_account,
      described_class,
      options: { relationships: relationships }
    )
  end

  let(:current_user) { Fabricate(:user) }
  let(:target_account) { Fabricate(:account) }
  let(:relationships) do
    AccountRelationshipsPresenter.new([target_account], current_user.account_id)
  end

  context 'when account note contains a profile emoji' do
    let(:profile_account) { Fabricate(:account) }

    before do
      Fabricate(
        :account_note,
        account: current_user.account,
        target_account: target_account,
        comment: "hello :@#{profile_account.username}:"
      )
    end

    it 'includes note_all_emojis with the profile emoji shortcode' do
      expect(subject['note']).to eq "hello :@#{profile_account.username}:"
      expect(subject['note_all_emojis']).to contain_exactly(
        include(
          'shortcode' => "@#{profile_account.username}",
          'account_id' => profile_account.id.to_s
        )
      )
    end
  end

  context 'when account note contains a custom emoji' do
    let(:custom_emoji) { Fabricate(:custom_emoji, shortcode: 'testemoji') }

    before do
      Fabricate(
        :account_note,
        account: current_user.account,
        target_account: target_account,
        comment: ":#{custom_emoji.shortcode}:"
      )
    end

    it 'includes note_all_emojis with the custom emoji shortcode' do
      expect(subject['note_all_emojis']).to contain_exactly(
        include('shortcode' => custom_emoji.shortcode)
      )
    end
  end

  context 'when account note is blank' do
    it 'returns an empty note_all_emojis array' do
      expect(subject['note_all_emojis']).to eq([])
    end

    it 'returns an empty note_formatted string' do
      expect(subject['note_formatted']).to eq('')
    end
  end

  context 'when account note contains animation syntax' do
    let(:profile_account) { Fabricate(:account) }
    let(:comment) { "[[[ :@#{profile_account.username}: ]]]" }

    before do
      Fabricate(
        :account_note,
        account: current_user.account,
        target_account: target_account,
        comment: comment
      )
    end

    it 'keeps the raw note and formats animation markup in note_formatted' do
      expect(subject['note']).to eq comment
      expect(subject['note_formatted']).to include('<span class="spin">')
      expect(subject['note_formatted']).to include(":@#{profile_account.username}:")
    end
  end
end
