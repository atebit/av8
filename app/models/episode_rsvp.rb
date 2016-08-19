# == Schema Information
#
# Table name: episode_rsvps
#
#  id          :integer          not null, primary key
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  user_id     :integer          not null
#  episode_id  :integer          not null
#  rsvp_status :string           default("none")
#  live_state  :string
#  av_state    :string
#
# Indexes
#
#  index_episode_rsvps_on_episode_id  (episode_id)
#  index_episode_rsvps_on_user_id     (user_id)
#

class EpisodeRsvp < ActiveRecord::Base

  belongs_to :episode
  belongs_to :user

  # session_state: none, attending, booted, paid?
  # live_state: " CONNECTED / STREAMING / IN_LINE / PREP_TO_BROADCAST / BROADCASTING / BANNED",
  # av_state: "ALL / VIDEO_ONLY / AUDIO_ONLY",
end
