Rails.application.routes.draw do

  devise_for :users

  resources :episodes do
    get "/backstage", to: "episodes#backstage", as: "backstage"
    get "/backstage/host", to: "episodes#host"
    get "/archives", to: "episodes#archives", as: "archives"
  end

  post "/api/episodes/:episode_id/update", to: "api/episodes#update"

  root to: 'pages#home'
end
