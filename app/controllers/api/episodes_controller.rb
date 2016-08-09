class Api::EpisodesController < Api::ApiController

  require 'pusher'
  
  before_action :authenticate_user!

  def update
    @episode = Episode.find( params[:episode_id] )

    # binding.pry
    Pusher.trigger(@episode.remote_session_id.to_s, 'update-view', {:message => params[:message].to_json})
    render json: "1"

  end


end
