class AddLocalOnlyFlagToStatuses < ActiveRecord::Migration[6.1]
  def change
    add_column :statuses, :local_only, :boolean
  end
end
