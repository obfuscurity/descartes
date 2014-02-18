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

      it 'loads specific pages when requested via :page' do
        get '/metrics/', :page => 1
        result = last_response.json
        expect(result.size).to eq(50)
        expect(result.first).to eq('metric.1')
        expect(result.last).to eq('metric.50')
      end

      it 'changes page size optionally via :limit' do
        get '/metrics/', :page => 2, :limit => 25
        result = last_response.json
        expect(result.size).to eq(25)
        expect(result.first).to eq('metric.26')
        expect(result.last).to eq('metric.50')
      end

      it 'assumes page 1 when :limit given & no :page' do
        get '/metrics/', :limit => 25
        result = last_response.json
        expect(result.size).to eq(25)
        expect(result.first).to eq('metric.1')
        expect(result.last).to eq('metric.25')
      end
    end
  end
end
