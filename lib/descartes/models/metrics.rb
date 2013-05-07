class Metric
  @@paths = []

  def self.all
    @@paths
  end

  def self.find(search)
    results = []
    @@paths.each do |p|
      results << p if p.match(/#{search}/i)
    end
   results 
  end

  def self.load
    self.update
  end

  def self.update
    response = RestClient.get("#{ENV['GRAPHITE_URL']}/metrics/index.json")
    @@paths = JSON.parse(response)
    MetricCacheStatus.update(:updated_at => Sequel.function(:NOW))
  end
end

class MetricCacheStatus < Sequel::Model(:metric_cache_status)
end
