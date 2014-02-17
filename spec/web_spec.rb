require 'rack/test'
require 'spec_helper'

require './lib/descartes/web'
require './lib/descartes/models/metrics'


describe Descartes::Web do
  include Rack::Test::Methods

  def app
    Descartes::Web
  end

  it 'should have more tests'

  describe '/metrics/' do
    context 'json' do
      it 'loads entire cache without any params'
      it 'loads specific pages when requested via :page'
      it 'changes page size optionally via :limit'
      it 'defaults to page size of 50 metrics'
    end
  end
end
