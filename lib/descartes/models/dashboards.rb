
class NilClass
  def method_missing(name, *args, &block)
  end
end

class Sequel::Model
  #def validates_config_syntax(input)
  #end
end

class Dashboard < Sequel::Model

  many_to_many :graphs
  
  plugin :boolean_readers
  plugin :prepared_statements
  plugin :prepared_statements_safe
  plugin :validation_helpers

  def before_create
    super
    self.enabled = true
    self.created_at = Time.now
    self.updated_at = Time.now
  end

  def before_update
    super
    self.updated_at = Time.now
  end

  def validate
    super
    validates_presence :uuid
    validates_presence :name
    #validates_config_syntax self.configuration
  end

  def destroy
    self.enabled = false
    self.save
  end

  def destroy!
    self.delete
  end

  def restore
    self.enabled = true
    self.save
  end
end
