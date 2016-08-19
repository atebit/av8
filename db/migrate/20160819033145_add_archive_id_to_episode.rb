class AddArchiveIdToEpisode < ActiveRecord::Migration
  def change
    add_column :episodes, :archive_id, :string
  end
end
