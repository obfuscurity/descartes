module Descartes
  class Web < Sinatra::Base

    get '/metrics/?' do
      if request.accept.include?("application/json")
        content_type "application/json"
        status 200
        Metric.all.to_json
      else
        haml :'metrics/list', :locals => { :title => "Descartes - Metrics List", :cache_age => MetricCacheStatus.first.updated_at.to_s }
      end
    end

    get '/metrics/search/?' do
      if request.accept.include?("application/json")
        content_type "application/json"
        status 200
        Metric.find(params[:pattern]).to_json
      else
        # halt
      end
    end

  end
end