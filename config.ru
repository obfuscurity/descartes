$:.unshift File.dirname(__FILE__) + '/lib'
require 'descartes/web'
require 'rack-canonical-host'

use Rack::CanonicalHost do
  case ENV["RACK_ENV"].to_sym
    when :production then ENV["CANONICAL_HOST"] if defined?ENV["CANONICAL_HOST"]
  end
end

use Rack::Session::Cookie, :key => "rack.session",
  :expire_after => 1209600,
  :secret => (ENV["SESSION_SECRET"] || raise("missing SESSION_SECRET"))

use OmniAuth::Strategies::GoogleApps,
  OpenID::Store::Redis.new(Redis.connect(:url => ENV["REDISTOGO_URL"]) || OpenID::Store::Redis.new(Redis.connect(:url => "redis://localhost:6379/1"))),
  :name => "google",
  :domain => ENV["GOOGLE_OAUTH_DOMAIN"]

run Descartes::Web
