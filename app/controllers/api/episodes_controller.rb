class Api::EpisodesController < Api::ApiController
  
  before_action :authenticate_user!


  # TODO: add fields to model
  # field: episode start time
  # field: episode end time
  # field: episode_state
  # field: archive_compile_config


  def set_episode_state
    @episode = Episode.find( params[:episode_id] )
    # set episode "session" state
    # PRE_SHOW / LIVE / ENDED
  end

  def get_episode_state
    # just return the session state
    # PRE_SHOW / LIVE / ENDED
  end

  def start_episode
    @episode = Episode.find( params[:episode_id] )
    # start archiving
  end

  def end_episode
    @episode = Episode.find( params[:episode_id] )
    # save end time
    # start compile and archive processs??
  end

  def update_archive_compile_config
    # a function for updating the configuration 
    # for use by ffmpeg to compile assets later
  end


end
