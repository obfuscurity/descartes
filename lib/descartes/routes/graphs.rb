module Descartes
  class Web < Sinatra::Base

    get '/graphs/?' do
      if request.accept.include?("application/json")
        @graphs = []
        if params[:tags]
          matching_graphs = []
          params[:tags].split(",").each do |tag|
            matching_graphs << Graph.select('graphs.*'.lit).from(:graphs, :tags).
              where(:graphs__enabled => true, :graphs__id => :tags__graph_id).
              filter(:tags__name.like(/#{tag}/i)).all
            matching_graphs << Graph.filter(:name.like(/#{tag}/i)).order(Sequel.desc(:views), Sequel.desc(:id)).all
          end
          known_graphs = []
          matching_graphs.flatten!
          matching_graphs.each do |g|
            unless known_graphs.include?(g.values[:id])
              known_graphs.push(g.values[:id])
              @graphs.push(g)
            end
          end
        else
          page_index = (params[:page] || 1).to_i
          page_count = 12
          @graphs << Graph.filter(:enabled => true).order(Sequel.desc(:views), Sequel.desc(:id)).paginate(page_index, page_count).all
        end
        content_type "application/json"
        status 200
        @graphs.flatten.to_json
      else
        status 200
        haml :'graphs/list', :locals => { :title => "Descartes - Graph List" }
      end
    end

    post '/graphs/?' do
      if params[:node]
        nodes = []
        nodes.push(params[:node]).flatten!
        name = params[:name] || nil
        nodes.each do |url|
          @graph = Graph.new({:owner => session['user']['email'], :url => url, :name => name}.reject {|k,v| v.nil?})
          @graph.save
        end
      end
      if request.accept.include?("application/json")
        status 200
        @graph.to_json
      else
        if nodes.count > 1
          redirect '/graphs'
        else
          redirect "/graphs/#{@graph.uuid}"
        end
      end
    end

    get '/graphs/:uuid/?' do
      @graph = Graph.filter(:uuid => params[:uuid]).first
      if request.accept.include?("application/json")
        content_type "application/json"
        status 200
        @graph.to_json
      else
        @graph.views += 1
        @graph.save
        status 200
        haml :'graphs/profile', :locals => { :graph => @graph, :title => "Descartes - Graph :: #{@graph.name}" }
      end
    end

    get '/graphs/:uuid/tags/?' do
      if request.accept.include?("application/json")
        content_type "application/json"
        @graph = Graph.filter(:uuid => params[:uuid]).first
        @tags = Tag.filter(:graph_id => @graph.id).order(:id).all
        status 200
        @tags.to_json
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
      @graph = Graph.filter(:uuid => params[:id]).first
      params.delete('id')
      # Need to serialize this here or Sequel::Model.plugin :json_serializer fucks with us
      if params[:overrides]
        @graph.update(:overrides => params[:overrides].to_json)
        params.delete('overrides')
      end
      params.each do |k,v|
        @graph.update(k.to_sym => v)
      end
      @graph.save
      status 200
      @graph.to_json
    end

    delete '/graphs/:id/?' do
      @graph = Graph.filter(:uuid => params[:id]).first
      GraphDashboardRelation.filter(:graph_id => @graph.id).all.each do |r|
        r.destroy
      end
      @graph.destroy
      status 204
    end

    post '/graphs/:id/gists/?' do
      if request.accept.include?("application/json")
        content_type "application/json"
        @graph = Graph.filter(:uuid => params[:id]).first
        @gist = Gist.new(:owner => session['user']['email'], :url => params[:url], :name => @graph.name, :data => params[:data], :graph_id => @graph.id)
        @gist.save
        status 200
        @gist.to_json
      else
        # halt
      end
    end

    post '/graphs/:id/comments/?' do
      if request.accept.include?("application/json")
        content_type "application/json"
        @graph = Graph.filter(:uuid => params[:uuid]).first
        @comment = Comment.new(:owner => session['user']['email'], :uuid => @graph.uuid)
        @comment.save
        status 200
        @comment.to_json
      else
        # halt
      end
    end
  end
end