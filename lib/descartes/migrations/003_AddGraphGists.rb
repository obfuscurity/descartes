
Sequel.migration do
  up do
    create_table(:gists) do
      primary_key :id
      String      :uuid,       :size => 32,  :null => false, :index => true, :unique => true
      String      :owner,      :size => 80,  :null => false, :index => true
      String      :image,                    :null => false, :index => true
      String      :name,       :size => 80
      Text        :description
      DateTime    :created_at,               :null => false
      DateTime    :expires_at
      foreign_key :graph_id, :graphs
    end
  end

  down do
    drop_table(:gists)
  end
end

