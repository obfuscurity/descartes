module Descartes
  class Web < Sinatra::Base

    get '/metrics/?' do
      haml :'metrics/list', :title => "Descartes - Metrics List"
    end

  end
end