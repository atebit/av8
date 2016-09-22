#  id         :integer          not null, primary key
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  user_id    :integer
#  message    :string
#  thread_id  :integer
#  starred    :boolean          default(FALSE)
#  flagged    :boolean          default(FALSE)


class Api::ChatThreadsController < Api::ApiController

  before_action :authenticate_user!

  def create
    # make sure requirements are met
    if chat_params[:content_type].blank? or chat_params[:content_id].blank?
      render json: "FAIL: content_type and content_id cannot be blank"
    end
    # save
    thread = ChatThread.new( chat_params )
    if thread.save
      render json: "SUCCESS: thread_id["<<thread.id.to_s<<"]"
    else
      render json: "FAIL: Chat thread not created"
    end
  end


  def update
    thread = ChatThread.find( chat_params[:id] )
    if thread.save
      render json: "SUCCESS: thread_id["<<thread.id.to_s<<"] updated"
    else
      render json: "FAIL: Chat thread not created"
    end
  end


  def destroy
    thread = ChatThread.find(chat_params[:id])
    if thread.destroy
      render json: "SUCCESS: Chat thread removed."
    else
      render json: "SUCCESS: Chat thread not removed."
    end
  end

  
  private


  def chat_params
    params.permit(
      :id,
      :content_type,
      :content_id,
      :archived
    )
  end

end
