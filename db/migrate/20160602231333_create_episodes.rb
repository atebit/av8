class CreateEpisodes < ActiveRecord::Migration
  def change
    create_table :episodes do |t|
      t.timestamps null: false

      t.datetime :started_at
      t.datetime :archived_at

      t.integer :user_id
      t.string :remote_session_id

      t.string :title
      t.text :info
    end
    
  end
end
