
Sequel.migration do
  up do
    create_table(:comments) do
      primary_key :id
      String      :g_uuid,     :size => 32,  :null => false, :index => true, :unique => true
      String      :uuid,       :size => 32,  :null => false, :index => true, :unique => true
      String      :owner,      :size => 80,  :null => false, :index => true
      Text        :body
      DateTime    :created_at,               :null => false
    end
  end

  down do
    drop_table(:comments)
  end
end

