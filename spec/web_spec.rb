require 'rspec'
require 'rack/test'
require 'spec_helper'

require './lib/descartes/web'
require './lib/descartes/models/metrics'


# Meh?
class Metric
  def self.paths=(paths)
    @@paths = paths
  end
end

# Don't see a way to do this natively in Rack. 'response.json' idea stolen
# from python-requests lib.
module Rack
  class Response
    def json
      JSON.parse(body)
    end
  end
end


describe Descartes::Web do
  include Rack::Test::Methods

  def app
    Descartes::Web
  end

  it 'should have more tests'

  describe '/metrics/' do
    context 'json' do
      before :each do
        # Be an API request.
        env 'HTTP_X_DESCARTES_API_TOKEN', ENV['API_TOKEN']
        header 'Accept', 'application/json'
        # Fake metric paths
        Metric.paths = 1.upto(100).to_a.map {|x| "metric.#{x}"}
      end

      it 'without any params, loads entire cache' do
        get '/metrics/'
        expect(last_response.json.size).to eq(100)
      end

      it 'loads specific pages when requested via :page'
      it 'changes page size optionally via :limit'
      it 'defaults to page size of 50 metrics'
    end
  end
end
