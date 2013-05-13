
Sequel.migration do
  up do
    alter_table(:users) do
      set_column_allow_null :email, true
    end
  end

  down do
    alter_table(:users) do
      set_column_allow_null :email, false
    end
  end
end

