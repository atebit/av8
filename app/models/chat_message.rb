class ChatMessage < ActiveRecord::Base

  belongs_to :user
  belongs_to :chat_thread

end

# == Schema Information
#
# Table name: chat_messages
#
#  id         :integer          not null, primary key
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  user_id    :integer
#  message    :string
#  thread_id  :integer
#  starred    :boolean          default(FALSE)
#  flagged    :boolean          default(FALSE)
#
