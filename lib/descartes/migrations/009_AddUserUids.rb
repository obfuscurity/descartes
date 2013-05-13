
Sequel.migration do
  up do
    alter_table(:users) do
      add_column :uid, String, :size => 40, :null => false, :index => true, :unique => true
    end
  end

  down do
    alter_table(:users) do
      drop_column :uid
    end
  end
end

