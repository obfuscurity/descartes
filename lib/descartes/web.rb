require 'sinatra'
require 'rack-ssl-enforcer'
require 'omniauth/openid'
require 'openid_redis_store'
require 'redis'
require 'haml'
require 'json'

require 'descartes/config'
require 'descartes/models/all'

module Descartes
  class Web < Sinatra::Base

    configure do
      enable :logging if Config.rack_env.eql?("production")
      disable :raise_errors if Config.rack_env.eql?("production")
      disable :show_exceptions if Config.rack_env.eql?("production")
      use Rack::SslEnforcer if Config.force_https
    end

    before do
      find_graphs
      find_dashboards
      if !((request.path_info =~ /\/auth/) || (request.path == '/health'))
        redirect '/auth/unauthorized' unless current_user
      end
    end

    error do
      e = request.env['sinatra.error']
      p e.message.split(',').first
    end

    helpers do
      def find_dashboards
        @dashboards = []
      end
      def find_graphs
        @graphs = []
      end
      def current_user
        @current_user ||= session['user']
      end
      def google_callback
        unless session['user']
          user = env['omniauth.auth']['user_info']
          email = user['email'].is_a?(Array) ? user['email'].first : user['email']
          email = email.downcase
          session['user'] = {
            'identity_url' => env['omniauth.auth']['uid'],
            'email' => email,
            'first_name' => user['first_name'],
            'last_name' => user['last_name']
          }
        end
        redirect '/'
      end
    end

    get '/auth/unauthorized' do
      session.clear
      redirect '/auth/google', 302
    end

    get '/auth/google/callback' do
      google_callback
    end

    post '/auth/google/callback' do
      google_callback
    end

    get '/' do
      p current_user["email"]
      haml :index
    end

    get '/graphs/?' do
    end

    post '/graphs/?' do
    end

    get '/graphs/:id/?' do
    end

    put '/graphs/:id/?' do
      # XXX do we want to handle tags here too?
    end

    delete '/graphs/:id/?' do
      Graph.filter(:uuid => param[:id]).first.destroy
    end

    get '/dashboards/?' do
    end

    post '/dashboards/?' do
    end

    get '/dashboards/:id/?' do
    end

    put '/dashboards/:id/?' do
      # XXX do we want to handle tags here too?
    end

    delete '/dashboards/:id/?' do
      Dashboard.filter(:uuid => param[:id]).first.destroy
    end
  end
end

