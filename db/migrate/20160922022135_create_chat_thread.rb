class CreateChatThread < ActiveRecord::Migration
  def change
    create_table :chat_threads do |t|

      t.timestamps null: false

      t.string :content_type
      t.integer :content_id
      
      t.boolean :archived

    end
  end
end
