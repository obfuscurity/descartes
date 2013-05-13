module Descartes
  class Web < Sinatra::Base

    get '/chartroulette/?' do
      if request.accept.include?("application/json")
        favorites = User.filter(:email => session['user']['email']).first.favorites
        content_type 'application/json'
        if !favorites.empty?
          status 200
          Dashboard.filter(:enabled => true).where(:uuid => favorites).to_json
        else
          status 204
        end
      else
        haml :chartroulette, :locals => { :title => 'Descartes - Chartroulette' }
      end
    end
  end
end