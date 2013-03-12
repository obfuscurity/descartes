
Sequel.migration do
  up do
    create_table(:gists) do
      primary_key :id
      String      :uuid,       :size => 32,  :null => false, :index => true, :unique => true
      String      :owner,      :size => 80,  :null => false, :index => true
      String      :name,       :size => 80
      Text        :description
      Text        :url
      Text        :configuration
      Text        :overrides
      Text        :data
      TrueClass   :enabled,                  :null => false, :default => false
      DateTime    :created_at,               :null => false
      DateTime    :updated_at,               :null => false
      foreign_key :graph_id, :graphs
    end
  end

  down do
    drop_table(:gists)
  end
end

