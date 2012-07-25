module Descartes
  class Web < Sinatra::Base

    get '/graphs/?' do
      if request.accept.include?("application/json")
        @graphs = []
        if params[:tags]
          @matching_graphs = []
          params[:tags].split(",").each do |tag|
            @matching_graphs << Graph.select('graphs.*'.lit).from(:graphs, :tags).
              where(:graphs__enabled => true, :graphs__id => :tags__graph_id).
              filter(:tags__name.like(/#{tag}/i)).all
            @matching_graphs << Graph.filter(:name.like(/#{tag}/i)).all
          end
          known_graphs = []
          @matching_graphs.flatten!
          @matching_graphs.each do |g|
            unless known_graphs.include?(g.values[:id])
              known_graphs.push(g.values[:id])
              @graphs.push(g)
            end
          end
        else
          @graphs << Graph.filter(:enabled => true).order(:id).reverse.all
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

    get '/graphs/:uuid/?' do
      @graph = Graph.filter(:uuid => params[:uuid]).first
      if request.accept.include?("application/json")
        content_type "application/json"
        @graph.to_json
      else
        haml :'graphs/profile', :locals => { :graph => @graph }
      end
    end

    get '/graphs/:uuid/tags/?' do
      if request.accept.include?("application/json")
        content_type "application/json"
        @graph = Graph.filter(:uuid => params[:uuid]).first
        @tags = Tag.filter(:graph_id => @graph.id).order(:id).all.to_json
      else
        # halt
      end
    end

    post '/graphs/:uuid/tags/?' do
      if request.accept.include?("application/json")
        content_type "application/json"
        @graph = Graph.filter(:uuid => params[:uuid]).first
        @tag = Tag.new(:name => params[:name], :graph_id => @graph.id)
        @tag.save
        status 204
      else
        # halt
      end
    end

    delete '/graphs/:uuid/tags/:id/?' do
      @graph = Graph.filter(:uuid => params[:uuid]).first
      @tag = Tag.select('tags.*'.lit).
        from(:tags, :graphs).
        where(:tags__id => params[:id], :graphs__uuid => params[:uuid], :tags__graph_id => :graphs__id).first
      @tag.destroy
      status 204
    end

    put '/graphs/:id/?' do
      # XXX do we want to handle tags here too?
      @graph = Graph.filter(:uuid => params[:id]).first
      params.delete('id')
      params.each do |k,v|
        @graph.update(k.to_sym => v)
      end
      @graph.save
      @graph.to_json
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