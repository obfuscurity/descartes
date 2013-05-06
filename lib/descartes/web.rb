require 'sinatra'
require 'rack-ssl-enforcer'
require 'omniauth-google-apps'
require 'openid_redis_store'
require 'rest-client'
require 'redis'
require 'haml'
require 'json'

require 'descartes/config'
require 'descartes/models/init'

module Descartes
  class Web < Sinatra::Base

    require 'descartes/routes/setup'
    require 'descartes/routes/helpers'
    require 'descartes/routes/auth'
    require 'descartes/routes/graphs'
    require 'descartes/routes/dashboards'
    require 'descartes/routes/metrics'
    require 'descartes/routes/gists'

    get '/' do
      haml :index
    end

    get '/metrics/find' do
      RestClient.get("#{ENV['GRAPHITE_URL']}#{request.env['REQUEST_URI']}")
    end

    get '/render/?' do
      RestClient.get("#{ENV['GRAPHITE_URL']}#{request.env['REQUEST_URI']}")
    end

    get '/browser/usergraph/?' do
      RestClient.get("#{ENV['GRAPHITE_URL']}#{request.env['REQUEST_URI']}")
    end
  end
end
