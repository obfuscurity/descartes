
class NilClass
  def method_missing(name, *args, &block)
  end
end

class Sequel::Model
end

class GraphDashboardRelation < Sequel::Model

  many_to_one :graphs
  many_to_one :dashboards

  def after_destroy
    if GraphDashboardRelation.filter(:dashboard_id => self.dashboard_id).empty?
      Dashboard[self.dashboard_id].destroy
    end
  end
end
