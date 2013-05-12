
class NilClass
  def method_missing(name, *args, &block)
  end
end

class Sequel::Model
end

class User < Sequel::Model

  plugin :validation_helpers

  def validate
    super
    validates_presence :email
  end

  def before_create
    super
    self.preferences = {:favorites => []}.to_json
    self.token = SecureRandom.hex(32)
    self.created_at = Time.now
    self.updated_at = Time.now
  end

  def before_update
    super
    self.updated_at = Time.now
  end
end
