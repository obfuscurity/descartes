module Descartes
  class Web < Sinatra::Base

    get '/favorites/?' do
      if json?
        content_type 'application/json'
        status 200
        JSON.parse(User.filter(:uid => session['user']['uid']).first.preferences)['favorites'].to_json
      else
        halt 404
      end
    end
  end
end
