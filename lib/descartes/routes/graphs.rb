module Descartes
  class Web < Sinatra::Base

    get '/graphs/?' do
      if request.accept.include?("application/json")
        @graphs = []
        if params[:tags]
          params[:tags].split(",").each do |tag|
            @graphs << Graph.select('graphs.*'.lit).from(:graphs, :tags).
              where(:graphs__enabled => true, :graphs__id => :tags__graph_id).
              filter(:tags__name.like(/#{tag}/i)).all
          end
        else
          @graphs << Graph.filter(:enabled => true).all
        end
        content_type "application/json"
        @graphs.flatten.to_json
      else
        haml :'graphs/list'
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
      @graph = Graph.filter(:uuid => params[:id]).first
      if request.accept.include?("application/json")
        content_type "application/json"
        @graph.to_json
      else
        haml :'graphs/profile', :locals => { :graph => @graph }
      end
    end

    put '/graphs/:id/?' do
      # XXX do we want to handle tags here too?
    end

    delete '/graphs/:id/?' do
      @graph = Graph.filter(:uuid => params[:id]).first
      GraphDashboardRelation.filter(:graph_id => @graph.id).all.each do |r|
        r.destroy
      end
      @graph.destroy
    end
  end
end