
namespace :db do
  require 'sequel'

  namespace :migrate do
    Sequel.extension :migration
    DB = Sequel.connect(ENV['DATABASE_URL'] || 'postgres://localhost/descartes')

    desc "Perform migration reset (full erase and migration up)"
    task :reset do
      Sequel::Migrator.run(DB, "lib/descartes/migrations", :target => 0)
      Sequel::Migrator.run(DB, "lib/descartes/migrations")
      puts "<= sq:migrate:reset executed"
    end

    desc "Perform migration up/down to VERSION"
    task :to do
      version = (ENV['version'] || ENV['VERSION']).to_i
      raise "No VERSION was provided" if version.nil?
      Sequel::Migrator.run(DB, "lib/descartes/migrations", :target => version)
      puts "<= sq:migrate:to version=[#{version}] executed"
    end

    desc "Perform migration up to latest migration available"
    task :up do
      Sequel::Migrator.run(DB, "lib/descartes/migrations")
      puts "<= sq:migrate:up executed"
    end

    desc "Perform migration down (erase all data)"
    task :down do
      Sequel::Migrator.run(DB, "lib/descartes/migrations", :target => 0)
      puts "<= sq:migrate:down executed"
    end
  end
end

require 'rspec/core/rake_task'

RSpec::Core::RakeTask.new(:spec) do |spec|
  spec.ruby_opts = '-I .'
end

# Resque tasks
require 'resque/tasks'
require 'resque_scheduler/tasks'

namespace :resque do
  task :setup do
    require './lib/descartes/models/init'
    require 'resque'
    require 'resque/scheduler'
    require 'resque_scheduler'
    Resque.redis = ENV['REDISTOGO_URL'] || 'redis://localhost:6379/1'
    Resque::Scheduler.dynamic = true
    Resque.set_schedule('metrics_update', {
      :every => ENV['METRICS_UPDATE_INTERVAL'],
      :class => 'MetricListUpdate',
      :queue => 'low',
      :description => 'This job will download /metrics/index.json from Graphite and update our metrics list.'
    })
  end
end

task :default => :spec
