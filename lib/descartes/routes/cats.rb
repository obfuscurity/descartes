module Descartes
  class Web < Sinatra::Base

    get '/cats/:count/?' do
      if json?
        content_type 'application/json'
        @cats = []
        begin
          doc = Nokogiri::HTML(open("http://thecatapi.com/api/images/get?format=xml&size=small&results_per_page=#{params[:count]}"))
          doc.css('url').each do |kitty|
            @cats << kitty.content
          end
        rescue => e
          p e.message
          halt
        end
        status 200
        @cats.to_json
      else
        halt 404
      end
    end
  end
end
