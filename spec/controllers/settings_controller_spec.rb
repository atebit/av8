require 'rails_helper'

RSpec.describe SettingsController, type: :controller do

  describe "GET #index" do
    it "returns http success" do
      get :index
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET #integrations" do
    it "returns http success" do
      get :integrations
      expect(response).to have_http_status(:success)
    end
  end

  # describe "GET #soundcloud" do
  #   it "returns http success" do
  #     get :soundcloud
  #     expect(response).to have_http_status(:success)
  #   end
  # end

end
