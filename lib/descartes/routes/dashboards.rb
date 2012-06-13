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

