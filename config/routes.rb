Rails.application.routes.draw do
  resources :members

  get "up" => "rails/health#show", as: :rails_health_check
end
