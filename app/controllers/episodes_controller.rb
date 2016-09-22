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
    data_string = "user_id="+current_user.id.to_s+"&email="+current_user.email+"&role="+current_user.role+"&time="+time.to_s

    @token = @opentok.generate_token( @remote_session_id, {
      # :role => :moderator,
      :data => data_string
    })

    # add self to RSVP list, for now
    episode_rsvp_check = EpisodeRsvp.where(episode_id: @episode.id, user_id: current_user.id ).first
    if episode_rsvp_check.blank?
      EpisodeRsvp.create(
        user_id: current_user.id,
        episode_id: @episode.id,
        rsvp_status: "attending"
      )
    end

    @episode_state = @episode.episode_state
    @attendees = get_episode_attendees( @episode.id )

    # @archive = @opentok.archives.find( @episode.archive_id )

    append_chat_thread

  end

  def backstage
    # TODO: when a new person views, send their user information along with session data within token.
    # only allow one moderator
    @episode = Episode.find( params[:episode_id] )
    @remote_session_id = @episode.remote_session_id

    time = Time.now
    data_string = "user_id="+current_user.id.to_s+"&email="+current_user.email+"&role="+current_user.role+"&time="+time.to_s

    @token = @opentok.generate_token( @remote_session_id, {
      :role => :moderator,
      :data => data_string
    })

    # add self to RSVP list, for now
    episode_rsvp_check = EpisodeRsvp.where(episode_id: @episode.id, user_id: current_user.id ).first
    if episode_rsvp_check.blank?
      EpisodeRsvp.create(
        user_id: current_user.id,
        episode_id: @episode.id,
        rsvp_status: "attending"
      )
    end

    @episode_state = @episode.episode_state
    @attendees = get_episode_attendees( @episode.id )

    # binding.pry
    append_chat_thread

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

    @episode = Episode.new(episode_params)
    @episode.remote_session_id = remote_session_id

    if @episode.save
      flash[:notice] = "Your event saved"
      redirect_to episode_backstage_path( @episode )
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


  def append_chat_thread

    thread = ChatThread.where( content_type: "episode", content_id: @episode.id).first
    if thread.present?
      @thread_id = thread.id
    else
      thread = ChatThread.new( content_type: "episode", content_id: @episode.id)
      if thread.save
        @thread_id = thread.id
      else
        @thread_id = -1
      end
    end
    
  end



  def episode_params
    params.require(:episode).permit(
      :title
    )
  end


  def get_episode_attendees( episode_id )

    attendees = []
    rsvps = EpisodeRsvp.where(episode_id: episode_id)

    if rsvps.present?
      rsvps.each do |rsvp|
        user = User.find_by_id( rsvp.user_id )
        if user.present?
          user_data = {}
          user_data[:id] = user.id
          # user_data[:name] = user.full_name
          user_data[:email] = user.email
          user_data[:role] = user.role
          user_data[:rsvp_status] = rsvp.rsvp_status
          user_data[:guest_state] = rsvp.live_state
          attendees.push( user_data )
        end
      end
    end

    return attendees
  end


end
