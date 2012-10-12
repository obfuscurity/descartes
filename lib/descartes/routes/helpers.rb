module Descartes
  class Web < Sinatra::Base

    helpers do
      def current_user
        @current_user ||= session['user']
      end
      def google_callback
        if session['redirect_to']
          redirect_to = session['redirect_to']
          session.clear
        end
        unless session['user']
          user = env['omniauth.auth']['info']
          email = user['email'].is_a?(Array) ? user['email'].first : user['email']
          email = email.downcase
          session['user'] = {
            'identity_url' => env['omniauth.auth']['uid'],
            'email' => email,
            'first_name' => user['first_name'],
            'last_name' => user['last_name']
          }
        end
        redirect redirect_to || '/'
      end
    end
  end
end
