class EpisodesController < OpentokController
  
  before_action :authenticate_user!

  def index
    @episodes = Episode.all.where("archived_at IS NULL")
  end

  def archives
    @episodes = Episode.all.where("archived_at IS NOT NULL")
  end



  def show
    # TODO: when a new person views, send their user information along with session data within token.
    @episode = Episode.find( params[:id] )
    @remote_session_id = @episode.remote_session_id

    time = Time.now
    data_string = "email="+current_user.email+"&role="+current_user.role+"&time="+time.to_s

    @token = @opentok.generate_token( @remote_session_id, {
      # :role => :moderator,
      :data => data_string
    })
  end



  def backstage
    # TODO: when a new person views, send their user information along with session data within token.
    # only allow one moderator
    @episode = Episode.find( params[:episode_id] )
    @remote_session_id = @episode.remote_session_id

    time = Time.now
    data_string = "email="+current_user.email+"&role="+current_user.role+"&time="+time.to_s

    @token = @opentok.generate_token( @remote_session_id, {
      :role => :moderator,
      :data => data_string
    })

  end


  def host
    # TODO: when a new person views, send their user information along with session data within token.
    # only allow one host
    @episode = Episode.find( params[:episode_id] )
    @remote_session_id = @episode.remote_session_id
    @token = @opentok.generate_token( @remote_session_id )
  end



  def new
    @episode = Episode.new
  end

  def create
    opentok_session = @opentok.create_session :media_mode => :routed
    remote_session_id = opentok_session.session_id

    @episode = Episode.new(session_params)
    @episode.remote_session_id = remote_session_id

    if @episode.save
      flash[:notice] = "Your event saved"
      redirect_to episode_path( @episode )
    else
      flash[:error] = "Unable to save"
      redirect_to :back
    end    
  end


  def edit
    @episode = Episode.find( params[:id] )
  end

  def update
    @episode = Episode.find( params[:id] )

    if @episode.update(episode_params)
      flash[:notice] = "Your event updated"
      redirect_to episodes_path( @episode )
    else
      flash[:error] = "Unable to update"
      redirect_to :back
    end    
  end




  def destroy
    # @opentok.archives.delete_by_id params[:archive_id]
  end


  private


  def episode_params
    params.require(:episode).permit(
      :title
    )
  end


end
