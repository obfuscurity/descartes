
Sequel.migration do
  up do
    create_table(:metric_cache_info) do
      DateTime :updated_at, :null => false
    end
  end

  down do
    drop_table(:metric_cache_info)
  end
end

