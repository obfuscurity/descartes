module Descartes
  class Web < Sinatra::Base

    get '/dashboards/?' do
      if request.accept.include?('application/json')
        @dashboards = []
        if params[:search]
          matching_dashboards = []
          params[:search].split(',').each do |search|
            matching_dashboards << Dashboard.select('dashboards.*'.lit, 'COUNT(graph_dashboard_relations.*) AS graph_count'.lit).
              from(:dashboards, :graph_dashboard_relations).
              where(:dashboards__enabled => true).
              where(:dashboards__id => :graph_dashboard_relations__dashboard_id).
              where(:dashboards__name.like(/#{search}/i)).
              group(:dashboards__id,
                    :dashboards__uuid,
                    :dashboards__owner,
                    :dashboards__name,
                    :dashboards__description,
                    :dashboards__configuration,
                    :dashboards__enabled,
                    :dashboards__created_at,
                    :dashboards__updated_at).
              order('LOWER(dashboards.name)'.lit).all
          end
          # Filter out duplicates
          known_dashboards = []
          matching_dashboards.flatten!
          matching_dashboards.each do |d|
            unless known_dashboards.include?(d.values[:id])
              known_dashboards.push(d.values[:id])
              @dashboards.push(d)
            end
          end
        else
          @dashboards << Dashboard.select('dashboards.*'.lit, 'COUNT(graph_dashboard_relations.*) AS graph_count'.lit).
            from(:dashboards, :graph_dashboard_relations).
            where(:dashboards__enabled => true).
            where(:dashboards__id => :graph_dashboard_relations__dashboard_id).
            group(:dashboards__id,
                  :dashboards__uuid,
                  :dashboards__owner,
                  :dashboards__name,
                  :dashboards__description,
                  :dashboards__configuration,
                  :dashboards__enabled,
                  :dashboards__created_at,
                  :dashboards__updated_at).
            order('LOWER(dashboards.name)'.lit).all
        end
        content_type 'application/json'
        @dashboards.flatten.to_json
      else
        haml :'dashboards/list', :locals => { :title => 'Descartes - Dashboard List' }
      end
    end

    post '/dashboards/?' do
      if request.accept.include?('application/json') && params[:uuids] && params[:name]
        owner = api_token? ? 'api@localhost' : session['user']['email']
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
        @graphs.flatten!
      else
        GraphDashboardRelation.filter(:dashboard_id => @dashboard.id).all.each do |r|
          @graphs.push(Graph[r.graph_id])
        end
      end
      if request.accept.include?('application/json')
        content_type 'application/json'
        { :dashboard => @dashboard, :graphs => @graphs }.to_json
      else
        if @dashboard.nil?
          redirect to '/dashboards', 303
        else
          haml :'dashboards/profile', :locals => { :dashboard => @dashboard, :title => "Descartes - Dashboard :: #{@dashboard.name}" }
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
      if request.accept.include?('application/json')
        if @dashboard = Dashboard.filter(:enabled => true, :uuid => params[:id]).first
          User.filter(:email => session['user']['email']).first.add_favorite(@dashboard.uuid)
          session['user']['preferences'] = User.filter(:email => session['user']['email']).first.preferences
          status 204
        else
          halt 404
        end
      else
        halt 400
      end
    end

    delete '/dashboards/:id/favorite/?' do
      if request.accept.include?('application/json')
        if @dashboard = Dashboard.filter(:enabled => true, :uuid => params[:id]).first
          User.filter(:email => session['user']['email']).first.remove_favorite(@dashboard.uuid)
          session['user']['preferences'] = User.filter(:email => session['user']['email']).first.preferences
          status 204
        else
          halt 404
        end
      else
        halt 400
      end
    end

    post '/dashboards/:id/graphs/?' do
      if request.accept.include?('application/json') && params[:uuids]
        @dashboard = Dashboard.filter(:enabled => true, :uuid => params[:id]).first
        params[:uuids].split(',').each do |g_uuid|
          @graph = Graph.filter(:enabled => true, :uuid => g_uuid).first
          GraphDashboardRelation.new(:dashboard_id => @dashboard.id, :graph_id => @graph.id).save
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