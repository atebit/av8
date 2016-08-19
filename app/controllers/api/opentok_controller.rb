class Api::OpentokController < Api::ApiController
  ## info: https://github.com/opentok/OpenTok-Ruby-SDK
  require "opentok"
  before_action :opentok_session
  
  private

  def opentok_session
    @opentok = OpenTok::OpenTok.new( ENV["OPENTOK_KEY"], ENV["OPENTOK_SECRET"])
  end

end