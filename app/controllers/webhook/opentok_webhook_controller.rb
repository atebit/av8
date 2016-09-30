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

  # an actual hook request "raw body"
  # {
  #   "id":"daf723a7-879d-4124-b8ba-a840831635e5",
  #   "status":"uploaded",
  #   "name":"webhook test 2",
  #   "reason":"user initiated",
  #   "sessionId":"1_MX40NTYwMDA4Mn5-MTQ3NTAwMTE2NjE3MH4rOGl1UklUNmdBZnlQZElnSGxQK2YydVB-fg",
  #   "projectId":45600082,
  #   "createdAt":1475001170000,
  #   "size":1027961,
  #   "duration":24,
  #   "outputMode":"individual",
  #   "hasAudio":true,
  #   "hasVideo":true,
  #   "certificate":"",
  #   "sha256sum":"D6GkDmb+aY17sVBE4XrZFUhQDTSee96WmN19Fvypixs=",
  #   "password":"",
  #   "updatedAt":1475001197837,
  #   "partnerId":45600082
  # }

  def status

    data = JSON.parse(request.body.read)

    # find the episode
    episode = Episode.where( archive_id: data["id"] ).first

    if episode.present?
      case data["status"]

      when "uploaded"
      when "available"

        # TODO: the archive is complete

        # TODO: maybe don't save this URL here...
        # episode.archive_assets_path = data["url"]
        # episode.save

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