require "opentok"

namespace :tokbox do
  desc "tokbox tasks"
  task listarchives: :environment do
  	opentok = OpenTok::OpenTok.new( ENV["OPENTOK_KEY"], ENV["OPENTOK_SECRET"])
  	puts "ID - Name - Session Id - Status"
  	opentok.archives.all.each do |archive|
  		puts "#{archive.id} - #{archive.name} - #{archive.session_id} - #{archive.status}"
  	end
  end

end
