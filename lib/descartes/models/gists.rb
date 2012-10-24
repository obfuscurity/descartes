
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

  mount_uploader :url, Uploader
end
