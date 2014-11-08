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
    if (ENV.has_key?('GRAPHITE_USER') && !ENV['GRAPHITE_USER'].empty? &&
        ENV.has_key?('GRAPHITE_PASS') && !ENV['GRAPHITE_PASS'].empty?)
      u.user = ENV['GRAPHITE_USER']
      u.password = CGI.escape(ENV['GRAPHITE_PASS'])
    end
    timeout = defined? ENV['METRICS_UPDATE_TIMEOUT'] ? ENV['METRICS_UPDATE_TIMEOUT'].to_i : 300
    request = RestClient::Resource.new("#{u.to_s}/metrics/index.json", :timeout => -1)
    response = request.get
    @@paths = JSON.parse(response)

    MetricCacheStatus.dataset.update(:updated_at => Sequel.function(:NOW))
  end
end

class MetricCacheStatus < Sequel::Model(:metric_cache_status)
end
