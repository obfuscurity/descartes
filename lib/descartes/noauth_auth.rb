module Descartes
  class NoAuth < Sinatra::Base
    before do
      session['user'] = { 'uid' => 'anonymous', 'email' => nil }
      redirect '/'
    end
  end
end
