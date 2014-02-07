module Descartes
  class Web < Sinatra::Base

    get '/gists/?' do
      if json?
        content_type "application/json"
        status 200
        Gist.all.to_json
      else
        # halt
      end
    end

    post '/gists/?' do
      if json?
        content_type "application/json"
        @gist = Gist.new(:owner => session['user']['uid'], :remote_image_url => params[:url])
        @gist.save
        status 200
        @gist.to_json
      else
        # halt
      end
    end

    get '/gists/:uuid/?' do
      if json?
        content_type "application/json"
        status 200
        Gist.filter(:uuid => params[:uuid]).first.to_json
      else
        # halt
      end
    end

    put '/gists/:uuid/?' do
      if json?
        content_type "application/json"
        @gist = Gist.filter(:uuid => params[:uuid]).first
        params.delete('uuid')
        params.each do |k,v|
          @gist.update(k.to_sym => v)
        end
        @gist.save
        status 200
        @gist.to_json
      else
        # halt
      end
    end

    delete '/gists/:uuid/?' do
      if json?
        content_type "application/json"
        Gist.filter(:uuid => params[:uuid]).first.destroy
        status 204
      else
        # halt
      end
    end

    post '/gists/:uuid/comments/?' do
      if json?
        content_type "application/json"
        @gist = Gist.filter(:uuid => params[:uuid]).first
        @comment = Comment.new(:owner => session['user']['uid'], :g_uuid => params[:uuid], :body => params[:body])
        @comment.save
        status 200
        @comment.to_json
      else
        # halt
      end
    end
  end
end
