
Sequel.migration do
  up do
    alter_table(:graph_dashboard_relations) do
      add_unique_constraint [:graph_id, :dashboard_id]
    end
  end
end
