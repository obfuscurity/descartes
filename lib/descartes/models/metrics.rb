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
    u = URI.parse(ENV['GRAPHITE_URL'])
    if (!ENV['GRAPHITE_USER'].empty? && !ENV['GRAPHITE_PASS'].empty?)
      u.user = ENV['GRAPHITE_USER']
      u.password = ENV['GRAPHITE_PASS']
    end
    response = RestClient.get("#{u.to_s}/metrics/index.json")
    @@paths = JSON.parse(response)
    MetricCacheInfo.update
  end
end

class MetricCacheStatus < Sequel::Model
  def update
    super
    self.updated_at = Time.now
  end
end
