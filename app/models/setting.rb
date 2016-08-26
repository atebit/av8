# == Schema Information
#
# Table name: settings
#
#  id                       :integer          not null, primary key
#  user_id                  :integer
#  soundcloud_access_token  :string
#  soundcloud_refresh_token :string
#  soundcloud_expires_in    :integer
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#
# Indexes
#
#  index_settings_on_user_id  (user_id) UNIQUE
#

class Setting < ActiveRecord::Base
  belongs_to :user

  def soundcloud_is_active?
  	self.soundcloud_access_token.present? && self.soundcloud_refresh_token.present? && self.soundcloud_expires_in.present?
  end
end
