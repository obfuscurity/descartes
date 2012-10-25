
class NilClass
  def method_missing(name, *args, &block)
  end
end

class Sequel::Model
end

class Comment < Sequel::Model

  many_to_one :graphs
  many_to_one :gists
  
  plugin :boolean_readers
  plugin :prepared_statements
  plugin :prepared_statements_safe
  plugin :validation_helpers

end
