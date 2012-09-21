require 'rack/test'
require 'spec_helper'

require './lib/descartes/web'

describe Descartes::Web do
  include Rack::Test::Methods

  def app
    Descartes::Web
  end

  it 'should have some tests'
end
