
Sequel.migration do
  up do
    alter_table(:users) do
      add_column :token, String, :size => 32, :null => false, :index => true, :unique => true
    end
  end

  down do
    alter_table(:users) do
      drop_column :token
    end
  end
end

