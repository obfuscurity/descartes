require 'sequel'
require 'securerandom'
require 'json'
require 'carrierwave/sequel'

db = ENV['DATABASE_URL'] || 'postgres://localhost/descartes'
Sequel.connect(db)

$LOAD_PATH.unshift File.dirname(__FILE__)
require 'graphs'
require 'tags'
require 'dashboards'
require 'graph_dashboard_relations'
require 'gists'

Sequel.extension :pagination
Sequel::Model.plugin :json_serializer
Graph.plugin :json_serializer
Dashboard.plugin :json_serializer
Tag.plugin :json_serializer
Gist.plugin :json_serializer
