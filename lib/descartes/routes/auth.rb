module Descartes
  class Web < Sinatra::Base

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
  end
end