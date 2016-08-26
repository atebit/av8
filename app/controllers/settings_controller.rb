require 'soundcloud'

class SettingsController < ApplicationController
  def integrations
  	@sc_client = soundcloud_client
  end

  def soundcloud
    sc_client = soundcloud_client

    begin
      sc_tokens = sc_client.exchange_token(:code => params[:code])
      current_user.setting.update(
        soundcloud_access_token: sc_tokens.access_token,
        soundcloud_refresh_token: sc_tokens.refresh_token,
        soundcloud_expires_in: sc_tokens.expires_in)
    rescue Soundcloud::ResponseError => e
      redirect_to settings_integrations_path, :flash => { :error => "Soundcloud integration error" }
    end

    redirect_to settings_integrations_path, :notice => "Soundcloud connected!"
  end

private
  def soundcloud_client
    return Soundcloud.new(
      :client_id => ENV["SOUNDCLOUD_CLIENT_ID"],
      :client_secret => ENV["SOUNDCLOUD_SECRET"],
      :redirect_uri => "#{ENV['BASE_URL']}/settings/integrations/soundcloud")
  end

end
