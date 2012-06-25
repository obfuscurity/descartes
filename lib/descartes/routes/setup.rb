module Descartes
  class Web < Sinatra::Base

    configure do
      enable :logging if Config.rack_env.eql?("production")
      disable :raise_errors if Config.rack_env.eql?("production")
      disable :show_exceptions if Config.rack_env.eql?("production")
      use Rack::SslEnforcer if Config.force_https
    end

    before do
      find_graphs
      find_dashboards
      if !((request.path_info =~ /\/auth/) || (request.path == '/health'))
        if !(request.accept.include?("application/json"))
          redirect '/auth/unauthorized' unless current_user
        end
      end
    end

    error do
      e = request.env['sinatra.error']
      p e.message.split(',').first
    end
  end
end