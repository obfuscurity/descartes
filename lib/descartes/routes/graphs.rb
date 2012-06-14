    get '/graphs/?' do
      haml :graphs, :locals => { :graphs => @graphs }
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
