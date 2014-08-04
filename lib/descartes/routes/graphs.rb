module Descartes
  class Web < Sinatra::Base

    get '/graphs/?' do
      if json?
        @graphs = []
        if params[:search]
          matching_graphs = []
          params[:search].split(',').each do |search|
            matching_graphs << Graph.select('graphs.*'.lit).from(:graphs, :tags).
              where(:graphs__enabled => true, :graphs__id => :tags__graph_id).
              filter(:tags__name.like(/#{search}/i)).all
            matching_graphs << Graph.filter(:name.like(/#{search}/i)).order(Sequel.desc(:views), Sequel.desc(:id)).all
          end
          # Filter out duplicates
          known_graphs = []
          matching_graphs.flatten!
          matching_graphs.each do |g|
            unless known_graphs.include?(g.values[:id])
              known_graphs.push(g.values[:id])
              @graphs.push(g)
            end
          end
          case params[:sort].to_s
          when 'name_asc'
            @graphs.sort_by! { |k| k[:name].downcase }
          when 'name_desc'
            @graphs.sort_by! { |k| k[:name].downcase }.reverse!
          when 'view_asc'
            @graphs.sort_by! { |k| k[:views] }
          when 'view_desc'
            @graphs.sort_by! { |k| k[:views] }.reverse!
          when 'oldest'
            @graphs.sort_by! { |k| k[:created_at] }
          when 'newest'
            @graphs.sort_by! { |k| k[:created_at] }.reverse!
          end
        else
          page_index = (params[:page] || 1).to_i
          page_count = 12
          case params[:sort].to_s
          when 'name_asc'
            @graphs << Graph.filter(:enabled => true).order(Sequel.asc(:name)).paginate(page_index, page_count).all
          when 'name_desc'
            @graphs << Graph.filter(:enabled => true).order(Sequel.desc(:name)).paginate(page_index, page_count).all
          when 'view_asc'
            @graphs << Graph.filter(:enabled => true).order(Sequel.asc(:views)).paginate(page_index, page_count).all
          when 'view_desc'
            @graphs << Graph.filter(:enabled => true).order(Sequel.desc(:views)).paginate(page_index, page_count).all
          when 'oldest'
            @graphs << Graph.filter(:enabled => true).order(Sequel.asc(:created_at)).paginate(page_index, page_count).all
          when 'newest'
            @graphs << Graph.filter(:enabled => true).order(Sequel.desc(:created_at)).paginate(page_index, page_count).all
          else
            @graphs << Graph.filter(:enabled => true).order(Sequel.desc(:views), Sequel.desc(:id)).paginate(page_index, page_count).all
          end
        end
        content_type 'application/json'
        status 200
        @graphs.flatten.to_json
      else
        status 200
        haml :'graphs/index', :locals => { :title => 'Descartes - Graph List' }
      end
    end

    post '/graphs/?' do
      if params[:node]
        nodes = []
        nodes.push(params[:node]).flatten!
        if params[:tag]
          tags = []
          tags.push(params[:tag]).flatten!
        end
        owner = api_token? ? 'api@localhost' : session['user']['uid']
        name = params[:name] || nil
        nodes.each do |url|
          @graph = Graph.new({:owner => owner, :url => url, :name => name}.reject {|k,v| v.nil?})
          @graph.save
          if !tags.empty?
            tags.each do |tag|
              @tag = Tag.new(:name => tag, :graph_id => @graph.id)
              @tag.save
            end
          end
        end
        if json?
          status 200
          # XXX - should return tags too
          @graph.to_json
        else
          if nodes.count > 1
            redirect '/graphs'
          else
            redirect "/graphs/#{@graph.uuid}"
          end
        end
      else
        halt 400
      end
    end

    get '/graphs/:uuid/?' do
      @graph = Graph.filter(:uuid => params[:uuid]).first
      if json?
        content_type 'application/json'
        status 200
        @graph.to_json
      else
        @graph.views += 1
        @graph.save
        status 200
        haml :'graphs/show', :locals => { :graph => @graph, :title => "Descartes - Graph :: #{@graph.name}" }
      end
    end

    get '/graphs/:uuid/tags/?' do
      if json?
        content_type 'application/json'
        @graph = Graph.filter(:uuid => params[:uuid]).first
        @tags = Tag.select(:id, :name).filter(:graph_id => @graph.id).order(:id).all
        status 200
        @tags.to_json
      else
        halt 400
      end
    end

    post '/graphs/:uuid/tags/?' do
      if json?
        content_type 'application/json'
        if params[:name]
          tags = []
          tags.push(params[:name]).flatten!
        end
        @graph = Graph.filter(:uuid => params[:uuid]).first
        if !tags.empty?
          tags.each do |tag|
            @tag = Tag.new(:name => tag, :graph_id => @graph.id)
            @tag.save
          end
        end
        status 204
      else
        halt 400
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
      if params[:overrides]
        # check to see if our data came in as a String (e.g. curl) or real JSON (from Descartes UI)
        overrides = params[:overrides].class.eql?(String) ? JSON.parse(params[:overrides]) : params[:overrides]
        # Need to serialize this here or Sequel::Model.plugin :json_serializer fucks with us
        @graph.update(:overrides => overrides.to_json)
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
      if json?
        content_type 'application/json'
        @graph = Graph.filter(:uuid => params[:id]).first
        @gist = Gist.new(:owner => session['user']['uid'], :url => params[:url], :name => @graph.name, :data => params[:data], :graph_id => @graph.id)
        @gist.save
        status 200
        @gist.to_json
      else
        halt 400
      end
    end

    post '/graphs/:id/comments/?' do
      if json?
        content_type 'application/json'
        @graph = Graph.filter(:uuid => params[:uuid]).first
        @comment = Comment.new(:owner => session['user']['uid'], :uuid => @graph.uuid)
        @comment.save
        status 200
        @comment.to_json
      else
        halt 400
      end
    end
  end
end
