
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
    self.uuid = SecureRandom.hex(16)
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
    validates_presence :name
    #validates_config_syntax self.configuration
  end

  def add_graph(uuids)
    uuids.split(",").each do |uuid|
      @graph = Graph.filter(:uuid => uuid).first
      GraphDashboardRelation.new(:graph_id => @graph.id, :dashboard_id => self.id).save
    end
  end
end
