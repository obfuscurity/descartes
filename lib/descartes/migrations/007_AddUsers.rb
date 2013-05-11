
Sequel.migration do
  up do
    create_table(:users) do
      primary_key :id
      String      :email,      :size => 80,  :null => false, :index => true
      Text        :preferences
      DateTime    :created_at,               :null => false
      DateTime    :updated_at,               :null => false
    end
  end

  down do
    drop_table(:users)
  end
end

