class ChangeSessionStateToEpisodeStateOnEpisode < ActiveRecord::Migration
  def change
    rename_column :episodes, :session_state, :episode_state
  end
end
