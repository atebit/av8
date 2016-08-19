Rails.application.routes.draw do

  devise_for :users

  resources :episodes do
    get "/backstage", to: "episodes#backstage", as: "backstage"
    get "/backstage/host", to: "episodes#host"
    get "/archives", to: "episodes#archives", as: "archives"
  end

  namespace :api do
    post "/episodes/:episode_id/start_episode", to: "episodes#start_episode", as: "episode_start"
    post "/episodes/:episode_id/end_episode", to: "episodes#end_episode", as: "episode_end"

    get "/episodes/:episode_id/get_episode_state", to: "episodes#get_episode_state", as: "get_episode_state"
    post "/episodes/:episode_id/set_episode_state", to: "episodes#set_episode_state", as: "set_episode_state"
    post "/episodes/:episode_id/update_rsvps", to: "episodes#update_rsvps", as: "episode_update_rsvps"
  end

  namespace :webhook do
    post '/opentok/archive_complete', to: "opentok_webhook_controller#archive_complete", as: "archive_complete"
  end

  root to: 'pages#home'
end
