class AddAvatarToEpisode < ActiveRecord::Migration
  def change
    add_column :episodes, :avatar, :string
  end
end