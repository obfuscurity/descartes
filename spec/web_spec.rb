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
        Metric.paths = 1.upto(100).to_a
      end

      def assert_array(size, start=nil, end_=nil)
        expect(last_response.ok?).to be_true # Fail fast
        result = last_response.json
        expect(result.size).to eq(size)
        expect(result.first).to(eq(start)) unless start.nil?
        expect(result.last).to(eq(end_)) unless end_.nil?
      end

      it 'without page/limit params, loads entire cache' do
        get '/metrics/', :_ => 12345 # ape real webapp behavior
        assert_array 100
      end

      it 'loads specific pages when requested via :page' do
        get '/metrics/', :page => 1
        assert_array 50, 1, 50
      end

      it 'changes page size optionally via :limit' do
        get '/metrics/', :page => 2, :limit => 25
        assert_array 25, 26, 50
      end

      it 'assumes page 1 when :limit given & no :page' do
        get '/metrics/', :limit => 25
        assert_array 25, 1, 25
      end
    end
  end
end
