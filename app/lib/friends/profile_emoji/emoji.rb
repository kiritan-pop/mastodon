module Friends
  module ProfileEmoji
    class FalsyLoaded
      def loaded?
        false
      end
    end
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

      def association(*_args)
        FalsyLoaded.new
      end
      
      class << self
        def from_text(text, domain)
          return [] if text.blank?

          shortcodes = text.scan(SCAN_RE).uniq

          return [] if shortcodes.empty?

          shortcodes.map { |shortcode, username, _, server|
            server ||= domain
            server = nil if server == Rails.configuration.x.local_domain
            [EntityCache.instance.avatar(username, server), shortcode[1..-2]]
          }.map { |account, shortcode| account ? new(account: account, shortcode: shortcode) : nil }.compact
        end
      end
    end
  end
end
