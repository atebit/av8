class CreateChatMessage < ActiveRecord::Migration
  def change
    create_table :chat_messages do |t|

      t.timestamps null: false
      t.integer :user_id
      t.string :message

      t.integer :thread_id

      t.boolean :starred, default: false
      t.boolean :flagged, default: false 

    end
  end
end
