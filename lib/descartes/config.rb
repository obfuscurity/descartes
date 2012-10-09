module Descartes
  module Config
    def self.env!(key)
      ENV[key] || raise("missing #{key}")
    end

    def self.canonical_host; ENV["CANONICAL_HOST"]; end
    def self.force_https; ENV["FORCE_HTTPS"]; end
    def self.port; env!("PORT").to_i; end
    def self.rack_env; env!("RACK_ENV"); end
    def self.user; env!("REMOTE_USER"); end
    def self.session_secret; env!("SESSION_SECRET"); end
  end
end
