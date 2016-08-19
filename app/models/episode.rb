# == Schema Information
#
# Table name: episodes
#
#  id                     :integer          not null, primary key
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  started_at             :datetime
#  archived_at            :datetime
#  user_id                :integer
#  remote_session_id      :string
#  title                  :string
#  info                   :text
#  avatar                 :string
#  ended_at               :datetime
#  episode_state          :string           default("FUTURE")
#  archive_compile_config :string
#  archive_assets_path    :string
#  archive_id             :string
#

class Episode < ActiveRecord::Base
  
  has_many :episode_rsvps

end
