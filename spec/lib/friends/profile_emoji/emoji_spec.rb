# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Friends::ProfileEmoji::Emoji do
  describe '#image' do
    subject { emoji.image }

    let(:emoji) { described_class.new(account: EntityCache.instance.mention(account.username, nil)) }
    let(:account) { Fabricate(:account) }

    it { is_expected.to respond_to :url }
  end

  describe '.from_text' do
    subject { described_class.from_text(text, domain) }

    let(:local_account) { Fabricate(:account) }
    let(:remote_account) { Fabricate(:account, domain: 'example.com') }

    context 'when domain not given' do
      let(:domain) { nil }
      let(:text) { "hello :@#{local_account.local_username_and_domain}: :@#{local_account.acct}: :@#{remote_account.acct}: :@not_found: world" }

      it { expect(subject.map(&:shortcode)).to eq ["@#{local_account.local_username_and_domain}", "@#{local_account.acct}", "@#{remote_account.acct}"] }
    end

    context 'when domain given' do
      let(:domain) { 'example.com' }
      let(:text) { "hello :@#{local_account.local_username_and_domain}: :@#{remote_account.acct}: :@#{remote_account.username}: :@not_found: world" }

      it { expect(subject.map(&:shortcode)).to eq ["@#{local_account.local_username_and_domain}", "@#{remote_account.acct}", "@#{remote_account.username}"] }
    end
  end
end
