# frozen_string_literal: true

module Friends
  module ProfileEmoji
    module EntityCacheExtension
      extend ActiveSupport::Concern

      def avatar(username, domain)
        Rails.cache.fetch(to_key(:avatar, username, domain), expires_in: EntityCache::MAX_EXPIRATION) { Account.select(:id, :username, :domain, :avatar_file_name, :avatar_storage_schema_version).find_remote(username, domain) }
      end

      def clear_avatar(username, domain)
        Rails.cache.delete(to_key(:avatar, username, domain))
      end
    end
  end
end
