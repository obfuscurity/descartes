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
      if params[:graphs] && params[:name]
        graphs = []
        graphs.push(params[:graphs].split(",")).flatten!
        configuration = { :graphs => graphs }
        @dashboard = Dashboard.new({ :owner => session['user']['email'], :name => params[:name], :configuration => configuration.to_json })
        @dashboard.save
        @dashboard.to_json
      else
        #halt
      end
    end

    get '/dashboards/:id/?' do
      #if request.accept.include?("application/json")
      #  @dashboard = Dashboard.filter(:enabled => true, :uuid => params[:id])
      #  content_type "application/json"
      #  @dashboard.to_json
      #else
      #  haml :dashboards
      #end
    end

    put '/dashboards/:id/?' do
      # XXX do we want to handle tags here too?
    end

    delete '/dashboards/:id/?' do
      Dashboard.filter(:uuid => param[:id]).first.destroy
    end
  end
end