module Descartes
  class Web < Sinatra::Base

    get '/dashboards/?' do
      if request.accept.include?("application/json")
        @dashboards = Dashboard.select('dashboards.*'.lit, 'COUNT(graph_dashboard_relations.*) AS graph_count'.lit).
          from(:dashboards, :graph_dashboard_relations).
          where(:dashboards__enabled => true, :dashboards__id => :graph_dashboard_relations__dashboard_id).
          group(:dashboards__id).
          order(:dashboards__updated_at).reverse
        content_type "application/json"
        @dashboards.to_json
      else
        haml :'dashboards/list'
      end
    end

    post '/dashboards/?' do
      if request.accept.include?("application/json") && params[:uuids] && params[:name]
        @dashboard = Dashboard.new({ :owner => session['user']['email'], :name => params[:name] })
        @dashboard.save
        @dashboard.add_graphs(params[:uuids])
        @dashboard.to_json
      else
        #halt
      end
    end

    get '/dashboards/:id/?' do
      @dashboard = Dashboard.filter(:enabled => true, :uuid => params[:id]).first
      @graphs = []
      if params[:tags]
        matching_graphs = []
        params[:tags].split(",").each do |tag|
          matching_graphs << Graph.select('graphs.*'.lit).from(:graphs, :graph_dashboard_relations, :dashboards, :tags).
            where(:graph_dashboard_relations__graph_id => :graphs__id,
                  :graph_dashboard_relations__dashboard_id => @dashboard.id,
                  :dashboards__id => :graph_dashboard_relations__dashboard_id,
                  :tags__graph_id => :graphs__id,
                  :graphs__enabled => true).
            filter(:tags__name.like(/#{tag}/i)).all
          matching_graphs << Graph.select('graphs.*'.lit).from(:graphs, :graph_dashboard_relations, :dashboards).
            where(:graph_dashboard_relations__graph_id => :graphs__id,
                  :graph_dashboard_relations__dashboard_id => @dashboard.id,
                  :dashboards__id => :graph_dashboard_relations__dashboard_id,
                  :graphs__enabled => true).
            filter(:graphs__name.like(/#{tag}/i)).all
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
      if request.accept.include?("application/json")
        content_type "application/json"
        { :dashboard => @dashboard, :graphs => @graphs }.to_json
      else
        haml :'dashboards/profile', :locals => { :dashboard => @dashboard }
      end
    end

    put '/dashboards/:id/?' do
      # XXX do we want to handle tags here too?
    end

    delete '/dashboards/:id/?' do
      @dashboard = Dashboard.filter(:uuid => params[:id]).first
      GraphDashboardRelation.filter(:dashboard_id => @dashboard.id).all.each do |r|
        r.destroy
      end
      status 204
    end

    delete '/dashboards/:dashboard_uuid/graphs/:graph_uuid/?' do
      @graph = Graph.filter(:uuid => params[:graph_uuid]).first
      @dashboard = Dashboard.filter(:uuid => params[:dashboard_uuid]).first
      GraphDashboardRelation.filter(:dashboard_id => @dashboard.id, :graph_id => @graph.id).first.destroy
    end
  end
end