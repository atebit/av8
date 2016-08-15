class Episode < ActiveRecord::Base
  
  has_many :episode_rsvps

end