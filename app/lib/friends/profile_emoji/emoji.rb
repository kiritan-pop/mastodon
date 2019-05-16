module Friends
  module ProfileEmoji
    class Emoji < ActiveModelSerializers::Model
      SHORTCODE_RE_FRAGMENT = /@(#{Account::USERNAME_RE})(?:@([a-z0-9\.\-]+[a-z0-9]+))?/i

      SCAN_RE = /(:#{SHORTCODE_RE_FRAGMENT}:)/x        
      attributes :account, :shortcode

      Image = Struct.new(:source) do
        def url(type = :original)
          type = :original unless source.content_type == 'image/gif'
          source.url(type)
        end
      end

      def serializer_class
        REST::CustomEmojiSerializer
      end

      def image
        @image ||= Image.new(account.avatar)
      end

      def visible_in_picker
        false
      end

      def has_attribute?(attr)
        true
      end

      def account_id
        account.id
      end

      class << self
        include RoutingHelper
        def from_text(text, domain)
          return [] if text.blank?

          shortcodes = text.scan(SCAN_RE).uniq

          return [] if shortcodes.empty?

          shortcodes.map { |_, username, _, shortcode_domain|
            search_domain = shortcode_domain
            if shortcode_domain then
              search_domain = nil  if shortcode_domain == root_url.split("/")[-1]
            else 
              search_domain = domain    if domain
            end
            [EntityCache.instance.avatar(username, search_domain), shortcode_domain ? '@' + username + '@' + shortcode_domain : '@' + username]
          }.compact.map { |account, shortcode| account ? new(account: account, shortcode: shortcode) : nil }.compact
        end
      end
    end
  end
end
