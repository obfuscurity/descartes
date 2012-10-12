module Descartes
  class Web < Sinatra::Base

    get '/auth/unauthorized' do
      redirect "/auth/#{ENV['OAUTH_PROVIDER']}", 302
    end

    post '/auth/google/callback' do
      google_callback
    end
  end
end