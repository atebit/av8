#  id         :integer          not null, primary key
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  user_id    :integer
#  message    :string
#  thread_id  :integer
#  starred    :boolean          default(FALSE)
#  flagged    :boolean          default(FALSE)


class Api::ChatMessagesController < Api::ApiController

  before_action :authenticate_user!
  include ApplicationHelper
  # to use things like "time_ago_in_words"
  include ActionView::Helpers::DateHelper


  def find
    if chat_params[:thread_id].present?
      messages = ChatMessage.where(thread_id: chat_params[:thread_id])
      generate_json( messages )
    else
      render json: "no chat thread id"
    end
  end


  def create

    chat_thread = ChatThread.find(chat_params[:thread_id])
    safe = true

    if chat_thread.present?
      if chat_thread.archived
        safe = false
      end
    end

    if safe
      message = ChatMessage.new( chat_params )
      message.user_id = current_user.id
      if message.save
        data = {}
        ## update the chat stream..
        render json: "SUCCESS: Chat message Created"
        Pusher.trigger('chat_stream', 'thread-' << chat_params[:thread_id], data)
      else
        render json: "FAIL: Chat message not created"
      end
    else
      render json: "FAIL: This chat thread is archived"
    end
  end


  def destroy
    message = ChatMessage.find(params[:id])
    if message.destroy
      render json: "SUCCESS: Chat message removed."
    else
      render json: "SUCCESS: Chat message not removed."
    end
  end


  private


  def parse_message( message )


    user = User.find_by_id(message.user_id)
    if user.present?
      p = {}
      p[:id] = message.id
      # TODO: make sure proper time zone
      p[:created_at] = time_ago_in_words(message.created_at)
      content = message.message
      content.gsub!(/\r\n?/, "\n")
      p[:content] = content
      p[:user] = {}
      p[:user][:id] = user.id
      p[:user][:name] = user.name
      p[:user][:active] = ( ! user.is_deleted? )
      return p
    end

    return nil
  end


  def generate_json( messages )
    json_messages = Array.new

    messages.each do |message|
      message_obj = parse_message(message)
      if message_obj.present?
        json_messages.push(message_obj)
      end
    end

    render json: json_messages
  end


  def chat_params
    params.permit(
      :id,
      :thread_id,
      :starred,
      :flagged,
      :message
    )
  end

end
