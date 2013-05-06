require 'sequel'
require 'securerandom'
require 'json'

$LOAD_PATH.unshift File.dirname(__FILE__)
require 'graphs'
require 'tags'
require 'dashboards'
require 'graph_dashboard_relations'
require 'gists'
require 'comments'
require 'metrics'

Sequel.extension :pagination
Sequel::Model.plugin :json_serializer
Graph.plugin :json_serializer
Dashboard.plugin :json_serializer
Tag.plugin :json_serializer
Gist.plugin :json_serializer
Comment.plugin :json_serializer
