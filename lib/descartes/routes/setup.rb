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
        if !(api_token? && json?)
          if !current_user
            session.clear
            session['redirect_to'] = request.path_info
            redirect '/auth/unauthorized'
          else
            session['user']['preferences'] = User.find_or_create_by_uid(session['user']).preferences
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
