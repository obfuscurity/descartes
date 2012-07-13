module Descartes
  class Web < Sinatra::Base

    get '/dashboards/?' do
      if request.accept.include?("application/json")
        if params[:owner]
          @dashboards = Dashboard.select('dashboards.*'.lit, 'COUNT(graph_dashboard_relations.*) AS graph_count'.lit).
            from(:dashboards, :graph_dashboard_relations).
            where(:dashboards__enabled => true, :dashboards__owner => session['user']['email'], :dashboards__id => :graph_dashboard_relations__dashboard_id).
            group(:dashboards__id)
        else
          @dashboards = Dashboard.select('dashboards.*'.lit, 'COUNT(graph_dashboard_relations.*) AS graph_count'.lit).
            from(:dashboards, :graph_dashboard_relations).
            where(:dashboards__enabled => true, :dashboards__id => :graph_dashboard_relations__dashboard_id).
            group(:dashboards__id).
            order(:dashboards__updated_at).reverse
        end
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

      # XXX - use intersection, e.g. [0,1] & [1,2] returns [1]
      if params[:tags]
        params[:tags].split(",").each do |tag|
          @tagged_graphs << Graph.select('graphs.*'.lit).from(:graphs, :tags).
            where(:graphs__enabled => true, :graphs__id => :tags__graph_id).
            filter(:tags__name.like(/#{tag}/i)).all
        end
      else
      end
      # XXX

      GraphDashboardRelation.filter(:dashboard_id => @dashboard.id).all.each do |r|
        @graphs.push(Graph[r.graph_id])
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
      @dashboard = Dashboard.filter(:uuid => params[:id]).first.destroy
    end

    delete '/dashboards/:dashboard_uuid/graphs/:graph_uuid/?' do
      @graph = Graph.filter(:uuid => params[:graph_uuid]).first
      @dashboard = Dashboard.filter(:uuid => params[:dashboard_uuid]).first
      GraphDashboardRelation.filter(:dashboard_id => @dashboard.id, :graph_id => @graph.id).first.destroy
    end
  end
end