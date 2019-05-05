# frozen_string_literal: true

class REST::CustomEmojiSerializer < ActiveModel::Serializer
  include RoutingHelper

  attributes :shortcode, :url, :static_url, :visible_in_picker, :account_id

  def url
    full_asset_url(object.image.url)
  end

  def static_url
    full_asset_url(object.image.url(:static))
  end

  def account_id
    object.has_attribute?(:account_id) ? object.account_id : nil
  end
end
