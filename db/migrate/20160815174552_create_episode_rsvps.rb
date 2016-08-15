class CreateEpisodeRsvps < ActiveRecord::Migration
  def change
    create_table :episode_rsvps do |t|

      t.timestamps null: false
      t.integer :user_id, null: false
      t.integer :episode_id, null: false

      t.string :rsvp_status, default: "none"

      t.index :user_id
      t.index :episode_id
    end
  end
end
