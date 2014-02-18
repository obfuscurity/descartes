module Descartes
  class Web < Sinatra::Base

    get '/metrics/?' do
      if request.xhr?
        # No params -> just return everything.
        metrics = if %w(page limit).map {|x| params.include?(x)}.none?
          Metric.all
        # Params -> paginate, depending.
        else
          page = (params['page'] || 1).to_i
          size = (params['limit'] || 50).to_i
          start = (page - 1) * size
          end_ = start + size
          Metric.all[start...end_]
        end

        # Response
        content_type "application/json"
        status 200
        metrics.to_json
      else
        haml :'metrics/index', :locals => { :title => "Descartes - Metrics List", :cache_age => MetricCacheStatus.first.updated_at.to_s }
      end
    end

    get '/metrics/search/?' do
      if request.xhr?
        content_type "application/json"
        status 200
        Metric.find(params[:pattern]).to_json
      else
        # halt
      end
    end

  end
end
