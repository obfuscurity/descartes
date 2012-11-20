module Descartes
  class Web < Sinatra::Base

    configure do
      enable :logging if Config.rack_env.eql?("production")
      disable :raise_errors if Config.rack_env.eql?("production")
      disable :show_exceptions if Config.rack_env.eql?("production")
      use Rack::SslEnforcer if Config.force_https
    end

    before do
      if !(request.path_info =~ /\/auth/)
        if !(api_token? && request.accept.include?("application/json"))
          if !current_user || !api_token?
            session.clear
            session['redirect_to'] = request.path_info
            redirect '/auth/unauthorized'
          end
        end
      end
    end

    error do
      e = request.env['sinatra.error']
      p e.message.split(',').first
    end
  end
end