class AddSessionStateToEpisode < ActiveRecord::Migration
  def change
    add_column :episodes, :ended_at, :datetime
    add_column :episodes, :session_state, :string, default: "FUTURE"
    add_column :episodes, :archive_compile_config, :string
    add_column :episodes, :archive_assets_path, :string
  end
end
