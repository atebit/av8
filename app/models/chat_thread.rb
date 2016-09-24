class ChatThread < ActiveRecord::Base
  
  has_many :chat_messages, dependent: :destroy

end

# == Schema Information
#
# Table name: chat_threads
#
#  id           :integer          not null, primary key
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  content_type :string
#  content_id   :integer
#  archived     :boolean
#
