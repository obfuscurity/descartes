
Sequel.migration do
  up do
    alter_table(:graphs) do
      add_column :views, Bignum, :null => false, :default => 0
    end
  end

  down do
    alter_table(:graphs) do
      drop_column :views
    end
  end
end

