module Descartes
  class Web < Sinatra::Base

    helpers do
      def find_dashboards
        @dashboards = Dashboard.filter(:enabled => true).all
      end
      def find_graphs
        @graphs = Graph.filter(:enabled => true).all
      end
      def current_user
        @current_user ||= session['user']
      end
      def google_callback
        unless session['user']
          user = env['omniauth.auth']['user_info']
          email = user['email'].is_a?(Array) ? user['email'].first : user['email']
          email = email.downcase
          session['user'] = {
            'identity_url' => env['omniauth.auth']['uid'],
            'email' => email,
            'first_name' => user['first_name'],
            'last_name' => user['last_name']
          }
        end
        redirect '/'
      end
    end
  end
end