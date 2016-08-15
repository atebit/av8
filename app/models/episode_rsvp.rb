class EpisodeRsvp < ActiveRecord::Base

  belongs_to :episode
  belongs_to :user

  # session_state: none, attending, booted, paid?
  # live_state: " CONNECTED / STREAMING / IN_LINE / PREP_TO_BROADCAST / BROADCASTING / BANNED",
  # av_state: "ALL / VIDEO_ONLY / AUDIO_ONLY",
end