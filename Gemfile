source 'https://rubygems.org'

#brakeman things this should be updated to 2.2.2
ruby "2.2.1"

gem 'rails', '4.2.1'
gem 'sass-rails', '~> 5.0'
gem 'uglifier', '>= 1.3.0'
gem 'coffee-rails', '~> 4.1.0'
# gem 'therubyracer', platforms: :ruby
gem 'jquery-rails'
gem 'font-awesome-rails'
# gem 'font-awesome-sass'
gem 'jbuilder', '~> 2.0' #readme, json views
gem 'react-rails', '~> 1.6.0'
# gem 'browserify-rails', '~> 1.0.1'
# gem 'searchlogic'
gem 'sdoc', '~> 0.4.0', group: :doc
gem 'devise' #readme
gem 'omniauth'
gem 'omniauth-twitter'
gem 'omniauth-facebook'
# gem 'omniauth-linkedin'
gem "recaptcha", require: "recaptcha/rails"

gem 'haml-rails' ## run $ rake haml:erb2haml
# gem "fog", "~> 1.35"
gem "fog-aws"
gem "aws-sdk"
gem 'pusher'
# gem 'resque'
# gem 'resque-scheduler'
gem 'time_difference'

gem 'carrierwave' #readme
gem 'carrierwave-data-uri'
gem 'mini_magick'
gem 'simple_form' #readme
gem 'cancancan' #readme
gem 'kaminari' # for pagination
gem 'autoprefixer-rails'
# gem 'sprockets-media_query_combiner'
gem "paranoia", "~> 2.0"
# gem "auto_html" # for scraping videos, images, and other media content for posts (http://rors.org/2010/08/15/auto_html)
gem 'carrierwave_direct' # for going diredtly to s3
# gem 'will_paginate', '~> 3.0.6'
# streaming service
gem "opentok", "~> 2.3"
gem 'braintree'
gem 'figaro'
gem 'mandrill-api'
gem 'sidekiq'
gem "devise-async"

gem 'airbrake'
gem 'rename'
gem 'local_time'

#
gem 'soundcloud'

group :development do
  gem 'annotate'
  gem 'quiet_assets'
  gem 'rails-audit'
  # gem 'ultrahook'
  gem 'web-console', '~> 2.0'
end

group :development, :test do
  gem 'sqlite3'
  gem 'byebug'
  gem 'pry'
  gem 'rspec-rails'
end

group :staging, :production do
  gem 'pg'
  gem 'thin'
  gem 'rails_12factor'
  gem 'capistrano-sidekiq'
end

