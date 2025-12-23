# == Route Map
#

Rails.application.routes.draw do
  resources :members

  get "up" => "rails/health#show", as: :rails_health_check

  # Rota para redirecionamento de URL curta (deve ser a última rota)
  get "/:short_code", to: "short_urls#redirect", as: :short_url_redirect, constraints: { short_code: /[a-zA-Z0-9]+/ }
end
