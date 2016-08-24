class CreateSettings < ActiveRecord::Migration
  def change
    create_table :settings do |t|
      t.references :user, index: {:unique=>true}, foreign_key: true
      t.string :soundcloud_access_token
      t.string :soundcloud_refresh_token
      t.integer :soundcloud_expires_in

      t.timestamps null: false
    end
  end
end
