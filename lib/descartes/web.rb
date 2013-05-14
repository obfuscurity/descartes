require 'sinatra'
require 'rack-ssl-enforcer'
require 'omniauth-google-apps'
require 'openid_redis_store'
require 'rest-client'
require 'redis'
require 'haml'
require 'json'
require 'nokogiri'
require 'open-uri'

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
    require 'descartes/routes/favorites'
    require 'descartes/routes/chartroulette'
    require 'descartes/routes/cats'

    get '/' do
      haml :index
    end
  end
end

