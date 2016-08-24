require 'test_helper'

class SettingsControllerTest < ActionController::TestCase
  test "should get integrations" do
    get :integrations
    assert_response :success
  end

end
