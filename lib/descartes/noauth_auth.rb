module Descartes
  class Descartes::NoAuth < Sinatra::Base
    before do
      session['user'] = { 'uid' => 'anonymous', 'email' => nil }
      redirect '/'
    end
  end
end
