# frozen_string_literal: true

module Friends
  module ProfileEmoji
    module AnnouncementsExtension
      extend ActiveSupport::Concern

      def profile_emojis
        return @profile_emojis if defined?(@profile_emojis)

        @profile_emojis = Friends::ProfileEmoji::Emoji.from_text(text, nil)
      end

      def all_emojis
        emojis + profile_emojis
      end
    end
  end
end
