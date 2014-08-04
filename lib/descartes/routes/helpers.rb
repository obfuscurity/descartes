module Descartes
  class Web < Sinatra::Base

    helpers do
      def api_token?
        request.env['HTTP_X_DESCARTES_API_TOKEN'].eql?(ENV['API_TOKEN'])
      end

      def current_user
        @current_user ||= session['user']
      end

      def google_callback
        if session['redirect_to']
          redirect_to = session['redirect_to']
          session.clear
        end
        unless session['user']
          info = env['omniauth.auth']['info']
          email = info['email'].is_a?(Array) ? info['email'].first : info['email']
          session['user'] = {
            'uid'   => env['omniauth.auth']['uid'].split('id=')[-1],
            'email' => email.downcase
          }
        end
        redirect redirect_to || '/'
      end

      def json?
        request.accept.map(&:to_s).include?('application/json')
      end
    end
  end
end
