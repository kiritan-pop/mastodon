# frozen_string_literal: true

class REST::AccountSerializer < ActiveModel::Serializer
  include RoutingHelper

  attributes :id, :username, :acct, :display_name, :locked, :bot, :created_at,
             :note, :url, :avatar, :avatar_static, :header, :header_static,
             :followers_count, :following_count, :statuses_count

  has_one :moved_to_account, key: :moved, serializer: REST::AccountSerializer, if: :moved_and_not_nested?
  has_many :emojis, serializer: REST::CustomEmojiSerializer

  class FieldSerializer < ActiveModel::Serializer
    attributes :name, :value, :verified_at

    def value
      Formatter.instance.format_field(object.account, object.value)
    end
  end

  has_many :fields

  def id
    object.id.to_s
  end

  def note
    Formatter.instance.simplified_format(object)
  end

  def url
    TagManager.instance.url_for(object)
  end

  def avatar
    full_asset_url(object.avatar_original_url)
  end

  def avatar_static
    full_asset_url(object.avatar_static_url)
  end

  def header
    full_asset_url(object.header_original_url)
  end

  def header_static
    full_asset_url(object.header_static_url)
  end

  def moved_and_not_nested?
    object.moved? && object.moved_to_account.moved_to_account_id.nil?
  end

  attribute :profile_emojis

  def profile_emojis
    result = {}
    mergetext = object.display_name.to_s + note.to_s
    mergetext.scan(/:@((([a-z0-9A-Z_]+([a-z0-9A-Z_\.-]+[a-z0-9A-Z_]+)?)(?:@[a-z0-9\.\-]+[a-z0-9]+)?)):/) do |item|
      tmp_username, tmp_domain = *item[0].split("@")
      if object.username == tmp_username  && (object.domain == tmp_domain || tmp_domain == nil)
        result[tmp_domain ? '@' + tmp_username + '@' + tmp_domain : '@' + tmp_username ] = {account_id:id, url:avatar, account_url:url}
      else
        src_domain = tmp_domain
        if tmp_domain
          src_domain = nil    if tmp_domain == root_url.split("/")[-1]
        else
          src_domain = object.domain    if object.domain
        end
        tmp_account = Account.find_remote(tmp_username, src_domain)
        if tmp_account
          result[ tmp_domain ? '@' + tmp_username + '@' + tmp_domain : '@' + tmp_username ] = {account_id:tmp_account.id.to_s, url:tmp_account.avatar_original_url, account_url:TagManager.instance.url_for(tmp_account)}
        end
      end
    end    
    return result
  end
end
