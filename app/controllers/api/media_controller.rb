class Api::MediaController < Api::OpentokController

  respond_to :mp4
  before_action :verify_purchase

  def get_archive_file


    episode = Episode.find_by_id( params[:episode_id] )
    archive = @opentok.archives.find( episode.archive_id )

    partnerId = archive.partnerId.to_s
    archive_id = archive.id.to_s

    s3 = Aws::S3::Resource.new(
      region: ENV['AWS_REGION'],
      access_key_id: ENV['AWS_KEY'],
      secret_access_key: ENV['AWS_SECRET']
    )

    key =  partnerId + "/" + archive_id + "/" + "archive.mp4"

    bucket = s3.bucket(ENV['AWS_BUCKET'])
    bucket.objects.limit(50).each do |item|
      # puts "Name:  #{item.key}"
      # puts "URL:   #{item.presigned_url(:get)}"
    end

    object = s3.bucket(ENV['AWS_BUCKET']).object(key)
    presigned_url = object.presigned_url(:get)

    data = open( presigned_url )
    send_data(
      data.read,
      filename: "/public/tmp/archives/" + SecureRandom.uuid + ".mp4",
      type: "video/mp4",
      disposition: "inline",
      stream: "true",
      buffer_size: "4096"
    )
  end

  private

  def verify_purchase
  end
  
end