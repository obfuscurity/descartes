
class NilClass
  def method_missing(name, *args, &block)
  end
end

class Sequel::Model
end

class Gist < Sequel::Model

  many_to_one :graphs
  
  plugin :boolean_readers
  plugin :prepared_statements
  plugin :prepared_statements_safe
  plugin :validation_helpers

  def before_validation
    super
    self.configuration = deconstruct(self.url)
  end

  def validate
    super
    validates_presence :owner
    validates_presence :name
    validates_presence :url
    validates_min_length 3, :data
  end

  def before_create
    super
    self.uuid = SecureRandom.hex(16)
    self.enabled = true
    self.created_at = Time.now
    self.updated_at = Time.now
  end

  def before_update
    super
    self.updated_at = Time.now
  end

  def deconstruct(url)
    c = {}
    CGI.parse(URI.parse(url).query).each do |k,v|
      # flatten all values except 'target'
      if (v.count === 1) && (!k.eql?('target'))
        v.count === 1 ? c[k] = v.first : c[k] = v
      else
        c[k] = v
      end
    end
    c.to_json
  end
end
