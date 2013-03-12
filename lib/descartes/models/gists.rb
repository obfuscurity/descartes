
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

  def validate
    super
    validates_presence :owner
  end

  def before_create
    super
    self.uuid = SecureRandom.hex(16)
    self.created_at = Time.now
  end
end
