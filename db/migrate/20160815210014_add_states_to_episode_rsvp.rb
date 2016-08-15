class AddStatesToEpisodeRsvp < ActiveRecord::Migration
  def change
    add_column :episode_rsvps, :live_state, :string
    add_column :episode_rsvps, :av_state, :string
  end
end
