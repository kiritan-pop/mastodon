# frozen_string_literal: true

class AddLocalOnlyFlagToStatuses < ActiveRecord::Migration[6.1]
  def change
    add_column :statuses, :local_only, :boolean, default: false, null: false
  end
end
