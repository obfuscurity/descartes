module Descartes
  class Web < Sinatra::Base

    get '/chartroulette/?' do
      if json?
        favorites = User.filter(:email => session['user']['email']).first.favorites
        content_type 'application/json'
        status 200
        Dashboard.filter(:enabled => true).where(:uuid => favorites).to_json
      else
        haml :chartroulette, :locals => { :title => 'Descartes - Chartroulette' }
      end
    end
  end
end
