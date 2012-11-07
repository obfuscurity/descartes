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
  end
end

class MetricListUpdate
  def self.perform
    Metric.update
  end
end