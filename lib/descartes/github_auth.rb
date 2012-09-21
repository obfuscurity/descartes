require "sinatra/base"
require "sinatra_auth_github"
module Descartes
  class GithubAuth < Sinatra::Base

    def self.fetch_env(key)
      ENV.fetch(key) { raise "No ENV var named #{key.inspect}" }
    end

    set :github_options, {
      :secret    => fetch_env('GITHUB_CLIENT_SECRET'),
      :client_id => fetch_env('GITHUB_CLIENT_ID'),
      :org_id    => fetch_env('GITHUB_ORG_ID'),
    }

    register Sinatra::Auth::Github

    before do
      unless github_user
        github_organization_authenticate!(settings.github_options[:org_id])
        binding.pry
        github_callback
      end
    end

    def github_callback
      unless session['user']
        user = github_user.login
        email = github_user.email || nil
        session['user'] = {
            "email" => email,
            "github_user" => user
        }
      end
      redirect '/'
    end

  end
end
