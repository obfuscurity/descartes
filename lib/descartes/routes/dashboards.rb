module Descartes
  class Web < Sinatra::Base

    get '/dashboards/?' do
      if params[:owner]
        @dashboards = Dashboard.filter(:enabled => true, :owner => session['user']['email']).all
      else
        @dashboards = Dashboard.filter(:enabled => true).all
      end
      haml :dashboards, :locals => { :dashboards => @dashboards }
    end

    post '/dashboards/?' do
      if request.accept.include?("application/json") && params[:uuids] && params[:name]
        @dashboard = Dashboard.new({ :owner => session['user']['email'], :name => params[:name] })
        @dashboard.save
        @dashboard.add_graph(params[:uuids])
        @dashboard.to_json
      else
        #halt
      end
    end

    get '/dashboards/:id/?' do
      @dashboard = Dashboard.filter(:enabled => true, :uuid => params[:id]).first
      @graphs = []
      GraphDashboardRelation.filter(:dashboard_id => @dashboard.id).all.each do |r|
        @graphs.push(Graph[r.graph_id])
      end
      if request.accept.include?("application/json")
        content_type "application/json"
        { :dashboard => @dashboard, :graphs => @graphs }.to_json
      else
        haml :dashboards, :locals => { :dashboard => @dashboard }
      end
    end

    put '/dashboards/:id/?' do
      # XXX do we want to handle tags here too?
    end

    delete '/dashboards/:id/?' do
      Dashboard.filter(:uuid => param[:id]).first.destroy
    end
  end
end