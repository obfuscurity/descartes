module Descartes
  class Web < Sinatra::Base

    get '/graphs/?' do
      if request.accept.include?("application/json")
        content_type "application/json"
        @graphs.to_json
      else
        haml :graphs, :locals => { :graphs => @graphs }
      end
    end

    post '/graphs/?' do
      if params[:node]
        nodes = []
        nodes.push(params[:node]).flatten!
        nodes.each do |n|
          name, url = n.split("!:!")
          @graph = Graph.new({:owner => session['user']['email'], :name => name, :url => url})
          @graph.save
        end
      end
      redirect '/graphs'
    end

    get '/graphs/:id/?' do
    end

    put '/graphs/:id/?' do
      # XXX do we want to handle tags here too?
    end

    delete '/graphs/:id/?' do
      Graph.filter(:uuid => param[:id]).first.destroy
    end
  end
end