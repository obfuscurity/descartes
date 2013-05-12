module Descartes
  class Web < Sinatra::Base

    get '/favorites/?' do
      if request.accept.include?("application/json")
        content_type "application/json"
        status 200
        JSON.parse(User.filter(:email => session['user']['email']).first.preferences)['favorites'].to_json
      else
        halt 404
      end
    end
  end
end