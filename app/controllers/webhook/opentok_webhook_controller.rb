class Webhook::OpentokWebhookController < ApplicationController

  skip_before_filter :verify_authenticity_token

  # Where it's pointed to: http://www.aviatertc.com/webhook/opentok/archive_complete
  # Documentation: https://tokbox.com/developer/guides/archiving/

  # what it looks like when it comes in...

  # "started" — The archive started and is in the process of being recorded.
  # "paused" — The archive is paused. This happens when all clients stop publishing streams after archive was started. If another client publishes, the archive recording resumes, and the status changes to "started". 60 seconds after the last client disconnects from the session, the archive recording stops, and the status changes to "stopped".
  # "stopped" — The archive stopped recording.
  # "uploaded" — The archive is available for download from the Amazon S3 bucket or Windows Azure container you specified at your TokBox Account.
  # "available" — The archive is available for download from the OpenTok cloud.
  # "expired" — The archive is no longer available for download from the OpenTok cloud. (Archives on the OpenTok cloud are only available for 72 hours from the time they are created.)
  # "failed" — The archive recording failed.

  # {
  #     "id" : "b40ef09b-3811-4726-b508-e41a0f96c68f",
  #     "event": "archive",
  #     "createdAt" : 1384221380000,
  #     "duration" : 328,
  #     "name" : "Foo",
  #     "partnerId" : 123456,
  #     "reason" : "",
  #     "sessionId" : "2_MX40NzIwMzJ-flR1ZSBPY3QgMjkgMTI6MTM6MjMgUERUIDIwMTN-MC45NDQ2MzE2NH4",
  #     "size" : 18023312,
  #     "status" : "available",
  #     "url" : "http://tokbox.com.archive2.s3.amazonaws.com/123456/b40ef09b-3811-4726-b508-e41a0f96c68f/archive.mp4"
  # }


  def archive_complete

    # find the episode
    episode = Episode.where( archive_id: params[:id] ).first

    if episode.present?
      case params[:status]

      when "uploaded"
      when "available"

        # TODO: the archive is complete

        # TODO: maybe don't save this URL here...
        episode.archive_assets_path = params[:url]
        episode.save

        puts "***** AV8: EPISODE ARCHIVE AVAILABLE *****"
        puts "                                          "
        puts "  episode_id: " + episode.id.to_s
        puts "                                          "
        puts "******************************************"

        ## Instead:
        # send to the compiler background job

        # in that compilation job...
        # download it
        # set episode.pisode_state to "compiling"

        # when it's downloaded: FFMpeg to compile the archive assets based on episode.archive_compile_config

        # when that is done, set episode.episode_state to "compiled"
        # save the compiled file to the aws bucket along with the split out assets
        # save reference to episode.archive_assets_path

      when "started"
      when "paused"
      when "stopped"
      when "expired"
      when "failed"

        puts "***** AV8: EPISODE ARCHIVE FAILED *****"
        puts "                                       "
        puts "  episode_id: " + episode.id.to_s
        puts "                                       "
        puts "***************************************"

      else

      end
      #end case
    end

    render json: { status: "ok" }
  end


end