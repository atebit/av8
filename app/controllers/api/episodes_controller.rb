class Api::EpisodesController < Api::ApiController
  
  before_action :authenticate_user!

  def update_rsvps
    # live_state: " CONNECTED / STREAMING / IN_LINE / PREP_TO_BROADCAST / BROADCASTING / BANNED",
    # av_state: "ALL / VIDEO_ONLY / AUDIO_ONLY",
    submitted_rsvps = JSON.parse(params[:rsvps]) if params[:rsvps].present?
    updated_rsvp_list = []
    if submitted_rsvps.present?
      # get all rsvps for this episode
      episode_rsvps = EpisodeRsvp.where( episode_id: params[:episode_id] )
      # loop throught he submitted rsvps
      submitted_rsvps.each do |submitted_rsvp|
        # loop through the episode rsvps
        episode_rsvps.each do |episode_rsvp|
          # if they match...
          if submitted_rsvp["user_id"] == episode_rsvp.user_id.to_s
            # update the rsvp in database
            episode_rsvp.live_state = submitted_rsvp["live_state"] if submitted_rsvp["live_state"].present?
            episode_rsvp.av_state = submitted_rsvp["av_state"] if submitted_rsvp["av_state"].present?
            if episode_rsvp.save
              updated_rsvp_list.push( {
                identity: submitted_rsvp["identity"],
                guest_state: submitted_rsvp["live_state"]
              })
              # binding.pry
            end
          end
        end
      end
    end
    # respond with the RSVPs that were found and updated.
    render json: updated_rsvp_list.to_json
  end



  def set_episode_state

    @episode = Episode.find( params[:episode_id] )


    if @episode.episode_state != "ENDED"

      @episode.episode_state = params[:episode_state]

      # save start/end times..
      if params[:episode_state] == "LIVE"

        @episode.started_at = Time.now
        # save the archive id for later
        # archive = opentok.archives.create session_id :name => "Important Presentation"
        archive = @opentok.archives.create @episode.remote_session_id, :output_mode => :individual, :name => @episode.title
        @episode.archive_id = archive.id

      elsif params[:episode_state] == "ENDED"

        archive = @opentok.archives.find @episode.archive_id
        if archive.present?
          # archive[:]
          # binding.pry
          @episode.ended_at = Time.now
          # stop archive
          archive = @opentok.archives.find( @episode.archive_id )
          if archive.status == "started" or archive.status == "paused"
            # "started" — The archive started and is in the process of being recorded.
            # "paused" — The archive is paused. This happens when all clients stop publishing streams after archive was started. If another client publishes, the archive recording resumes, and the status changes to "started". 60 seconds after the last client disconnects from the session, the archive recording stops, and the status changes to "stopped".
            # "stopped" — The archive stopped recording.
            # "uploaded" — The archive is available for download from the Amazon S3 bucket or Windows Azure container you specified at your TokBox Account.
            # "available" — The archive is available for download from the OpenTok cloud.
            # "expired" — The archive is no longer available for download from the OpenTok cloud. (Archives on the OpenTok cloud are only available for 72 hours from the time they are created.)
            # "failed" — The archive recording failed.
            @opentok.archives.stop_by_id @episode.archive_id
          end
        end
        
      end

      if @episode.save
        render json: {
          status: 200,
          message: "Episode session state updated."
        }.to_json
      else
        render json: {
          status: 204,
          message: "Could not set episode state."
        }.to_json
      end
    end
  end

  def get_episode_state
    # future / preshow / live / ended
    @episode = Episode.find( params[:episode_id] )

    data = {}
    data[:episode_state] = @episode.episode_state
    data[:attendees] = get_episode_attendees( @episode.id )

    render json: data.to_json

  end



  def update_archive_compile_config
    # a function for updating the configuration 
    # for use by ffmpeg to compile assets later
  end






  private



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
          user_data[:live_state] = rsvp.live_state
          user_data[:av_state] = rsvp.av_state
          user_data[:rsvp_status] = rsvp.rsvp_status
          attendees.push( user_data )
        end
      end
    end

    return attendees
  end

end
