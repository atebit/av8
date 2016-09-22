# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20160922022135) do

  create_table "chat_messages", force: :cascade do |t|
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
    t.integer  "user_id"
    t.string   "message"
    t.integer  "thread_id"
    t.boolean  "starred",    default: false
    t.boolean  "flagged",    default: false
  end

  create_table "chat_threads", force: :cascade do |t|
    t.datetime "created_at",   null: false
    t.datetime "updated_at",   null: false
    t.string   "content_type"
    t.integer  "content_id"
    t.boolean  "archived"
  end

  create_table "episode_rsvps", force: :cascade do |t|
    t.datetime "created_at",                   null: false
    t.datetime "updated_at",                   null: false
    t.integer  "user_id",                      null: false
    t.integer  "episode_id",                   null: false
    t.string   "rsvp_status", default: "none"
    t.string   "live_state"
    t.string   "av_state"
  end

  add_index "episode_rsvps", ["episode_id"], name: "index_episode_rsvps_on_episode_id"
  add_index "episode_rsvps", ["user_id"], name: "index_episode_rsvps_on_user_id"

  create_table "episodes", force: :cascade do |t|
    t.datetime "created_at",                                null: false
    t.datetime "updated_at",                                null: false
    t.datetime "started_at"
    t.datetime "archived_at"
    t.integer  "user_id"
    t.string   "remote_session_id"
    t.string   "title"
    t.text     "info"
    t.string   "avatar"
    t.datetime "ended_at"
    t.string   "episode_state",          default: "FUTURE"
    t.string   "archive_compile_config"
    t.string   "archive_assets_path"
    t.string   "archive_id"
  end

  create_table "settings", force: :cascade do |t|
    t.integer  "user_id"
    t.string   "soundcloud_access_token"
    t.string   "soundcloud_refresh_token"
    t.integer  "soundcloud_expires_in"
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
  end

  add_index "settings", ["user_id"], name: "index_settings_on_user_id", unique: true

  create_table "users", force: :cascade do |t|
    t.string   "first_name",             default: "",     null: false
    t.string   "last_name",              default: "",     null: false
    t.string   "email",                  default: "",     null: false
    t.string   "encrypted_password",     default: "",     null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,      null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at",                              null: false
    t.datetime "updated_at",                              null: false
    t.string   "role",                   default: "user"
  end

  add_index "users", ["email"], name: "index_users_on_email", unique: true
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true

end
