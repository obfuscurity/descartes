module Descartes
  class Web < Sinatra::Base

    get '/dashboards/?' do
      if json?
        @dashboards = []
        if params[:search]
          @dashboards = Dashboard.get_dashboards_with_graphs_by_search(params[:search])
        elsif params[:favorites] == 'true'
          @dashboards = Dashboard.get_favorite_dashboards_with_graphs_by_user(session['user']['uid'])
        else
          @dashboards = Dashboard.get_dashboards_with_graphs
        end
        content_type 'application/json'
        @dashboards.flatten.to_json
      else
        haml :'dashboards/index', :locals => { :title => 'Descartes - Dashboard List' }
      end
    end

    post '/dashboards/?' do
      if json? && params[:uuids] && params[:name]
        owner = api_token? ? 'api@localhost' : session['user']['uid']
        @dashboard = Dashboard.new({ :owner => owner, :name => params[:name] })
        @dashboard.save
        @dashboard.add_graphs(params[:uuids])
        @dashboard.to_json
      else
        halt 400
      end
    end

    get '/dashboards/:id/?' do
      # XXX - should return graph uuids for each dashboard
      @dashboard = Dashboard.filter(:enabled => true, :uuid => params[:id]).first
      @graphs = []
      if params[:search]
        matching_graphs = []
        params[:search].split(',').each do |search|
          matching_graphs << Graph.select('graphs.*'.lit).from(:graphs, :graph_dashboard_relations, :dashboards, :tags).
            where(:graph_dashboard_relations__graph_id => :graphs__id,
                  :graph_dashboard_relations__dashboard_id => @dashboard.id,
                  :dashboards__id => :graph_dashboard_relations__dashboard_id,
                  :tags__graph_id => :graphs__id,
                  :graphs__enabled => true).
            filter(:tags__name.like(/#{search}/i)).all
          matching_graphs << Graph.select('graphs.*'.lit).from(:graphs, :graph_dashboard_relations, :dashboards).
            where(:graph_dashboard_relations__graph_id => :graphs__id,
                  :graph_dashboard_relations__dashboard_id => @dashboard.id,
                  :dashboards__id => :graph_dashboard_relations__dashboard_id,
                  :graphs__enabled => true).
            filter(:graphs__name.like(/#{search}/i)).all
          known_graphs = []
          matching_graphs.flatten!
          matching_graphs.each do |g|
            unless known_graphs.include?(g.values[:id])
              known_graphs.push(g.values[:id])
              @graphs.push(g)
            end
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
        @graphs.flatten!
      else
        GraphDashboardRelation.filter(:dashboard_id => @dashboard.id).all.each do |r|
          @graphs.push(Graph[r.graph_id])
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
      end
      if json?
        content_type 'application/json'
        { :dashboard => @dashboard, :graphs => @graphs }.to_json
      else
        if @dashboard.nil?
          redirect to '/dashboards', 303
        else
          fullscreen = params[:fullscreen] === 'true' ? true : false
          haml :'dashboards/show', :locals => { :dashboard => @dashboard, :title => "Descartes - Dashboard :: #{@dashboard.name}", :fullscreen => fullscreen }
        end
      end
    end

    put '/dashboards/:id/?' do
      @dashboard = Dashboard.filter(:uuid => params[:id]).first
      params.delete('id')
      params.each do |k,v|
        @dashboard.update(k.to_sym => v)
      end
      @dashboard.save
      status 200
      @dashboard.to_json
    end

    post '/dashboards/:id/favorite/?' do
      if json?
        if @dashboard = Dashboard.filter(:enabled => true, :uuid => params[:id]).first
          User.filter(:uid => session['user']['uid']).first.add_favorite(@dashboard.uuid)
          session['user']['preferences'] = User.filter(:uid => session['user']['uid']).first.preferences
          status 204
        else
          halt 404
        end
      else
        halt 400
      end
    end

    delete '/dashboards/:id/favorite/?' do
      if json?
        if @dashboard = Dashboard.filter(:enabled => true, :uuid => params[:id]).first
          User.filter(:uid => session['user']['uid']).first.remove_favorite(@dashboard.uuid)
          session['user']['preferences'] = User.filter(:uid => session['user']['uid']).first.preferences
          status 204
        else
          halt 404
        end
      else
        halt 400
      end
    end

    post '/dashboards/:id/graphs/?' do
      if json? && params[:uuids]
        @dashboard = Dashboard.filter(:enabled => true, :uuid => params[:id]).first
        params[:uuids].split(',').each do |g_uuid|
          @graph = Graph.filter(:enabled => true, :uuid => g_uuid).first
          begin
            GraphDashboardRelation.new(:dashboard_id => @dashboard.id, :graph_id => @graph.id).save
          rescue Sequel::DatabaseError => e
            p e.message
            redirect to "/dashboards/#{@dashboard.uuid}", 302
          end
        end
        status 204
      else
        halt 400
      end
    end

    delete '/dashboards/:dashboard_uuid/graphs/:graph_uuid/?' do
      @graph = Graph.filter(:uuid => params[:graph_uuid]).first
      @dashboard = Dashboard.filter(:uuid => params[:dashboard_uuid]).first
      GraphDashboardRelation.filter(:dashboard_id => @dashboard.id, :graph_id => @graph.id).first.destroy
      status 204
    end

    delete '/dashboards/:id/?' do
      @dashboard = Dashboard.filter(:uuid => params[:id]).first
      GraphDashboardRelation.filter(:dashboard_id => @dashboard.id).all.each do |r|
        r.destroy
      end
      status 204
    end
  end
end
