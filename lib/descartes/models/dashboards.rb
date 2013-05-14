
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

  def after_destroy
    super
    User.remove_favorite_for_everyone(self.uuid)
  end

  def graph_count
    self[:graph_count]
  end

  def add_graphs(uuids)
    uuids.split(",").each do |uuid|
      @graph = Graph.filter(:uuid => uuid).first
      GraphDashboardRelation.new(:graph_id => @graph.id, :dashboard_id => self.id).save
    end
  end

  def self.get_dashboards_with_graphs
    Dashboard.select('dashboards.*'.lit, 'COUNT(graph_dashboard_relations.*) AS graph_count'.lit).
      from(:dashboards, :graph_dashboard_relations).
      where(:dashboards__enabled => true).
      where(:dashboards__id => :graph_dashboard_relations__dashboard_id).
      group(:dashboards__id,
            :dashboards__uuid,
            :dashboards__owner,
            :dashboards__name,
            :dashboards__description,
            :dashboards__configuration,
            :dashboards__enabled,
            :dashboards__created_at,
            :dashboards__updated_at).
      order('LOWER(dashboards.name)'.lit).all
  end

  def self.get_favorite_dashboards_with_graphs_by_user(uid)
    Dashboard.select('dashboards.*'.lit, 'COUNT(graph_dashboard_relations.*) AS graph_count'.lit).
      from(:dashboards, :graph_dashboard_relations).
      where(:dashboards__enabled => true).
      where(:dashboards__id => :graph_dashboard_relations__dashboard_id).
      where(:dashboards__uuid => User.filter(:uid => uid).first.favorites).
      group(:dashboards__id,
            :dashboards__uuid,
            :dashboards__owner,
            :dashboards__name,
            :dashboards__description,
            :dashboards__configuration,
            :dashboards__enabled,
            :dashboards__created_at,
            :dashboards__updated_at).
      order('LOWER(dashboards.name)'.lit).all
  end

  def self.get_dashboards_with_graphs_by_search(params)
    dashboards = []
    matching_dashboards = []
    params.split(',').each do |search|
      matching_dashboards << Dashboard.select('dashboards.*'.lit, 'COUNT(graph_dashboard_relations.*) AS graph_count'.lit).
        from(:dashboards, :graph_dashboard_relations).
        where(:dashboards__enabled => true).
        where(:dashboards__id => :graph_dashboard_relations__dashboard_id).
        where(:dashboards__name.like(/#{search}/i)).
        group(:dashboards__id,
              :dashboards__uuid,
              :dashboards__owner,
              :dashboards__name,
              :dashboards__description,
              :dashboards__configuration,
              :dashboards__enabled,
              :dashboards__created_at,
              :dashboards__updated_at).
        order('LOWER(dashboards.name)'.lit).all
    end
    # Filter out duplicates
    known_dashboards = []
    matching_dashboards.flatten!
    matching_dashboards.each do |d|
      unless known_dashboards.include?(d.values[:id])
        known_dashboards.push(d.values[:id])
        dashboards.push(d)
      end
    end
    dashboards
  end
end
