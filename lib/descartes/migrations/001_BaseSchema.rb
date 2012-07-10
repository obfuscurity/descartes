
Sequel.migration do
  up do
    create_table(:graphs) do
      primary_key :id
      String      :uuid,          :size => 32, :null => false, :index => true, :unique => true
      String      :owner,         :size => 80, :null => false, :index => true
      String      :name,          :size => 80, :null => false
      Text        :description
      Text        :url
      Text        :configuration
      Text        :overrides
      TrueClass   :enabled,                    :null => false, :default => false
      DateTime    :created_at,                 :null => false
      DateTime    :updated_at,                 :null => false
    end

    create_table(:dashboards) do
      primary_key :id
      String      :uuid,          :size => 32, :null => false, :index => true, :unique => true
      String      :owner,         :size => 80, :null => false, :index => true
      String      :name,          :size => 80, :null => false
      Text        :description
      Text        :configuration
      TrueClass   :enabled,                    :null => false, :default => false
      DateTime    :created_at,                 :null => false
      DateTime    :updated_at,                 :null => false
    end

    create_table(:graph_dashboard_relations) do
      primary_key :id
      foreign_key :graph_id, :graphs
      foreign_key :dashboard_id, :dashboards
    end

    create_table(:tags) do
      primary_key :id
      String      :name,          :size => 80, :null => false, :index => true
      foreign_key :graph_id, :graphs
    end
  end

  down do
    drop_table(:tags, :graph_dashboard_relations, :graphs, :dashboards)
  end
end

