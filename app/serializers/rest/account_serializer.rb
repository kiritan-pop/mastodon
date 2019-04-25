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
    mergetext.scan(/:@((([a-z0-9_]+([a-z0-9_\.-]+[a-z0-9_]+)?)(?:@[a-z0-9\.\-]+[a-z0-9]+)?)):/) do |item|
      tmp_username = item[0]
      if object.username == tmp_username
        result['@' + tmp_username] = {account_id:id, url:avatar, account_url:url}
      else
        if tmp_username.include?("@")
          tmp_account = Account.find_remote(tmp_username.split("@")[0], tmp_username.split("@")[1])
        else
          tmp_account = Account.find_local(tmp_username)
        end
        if tmp_account
          tmp_account = REST::AccountSerializer.new(tmp_account)
          result['@' + tmp_username] = {account_id:tmp_account.attributes[:id], url:tmp_account.attributes[:avatar], account_url:tmp_account.attributes[:url]}
        end  
      end
    end
    return result
  end
end
