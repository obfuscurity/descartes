
class Uploader < CarrierWave::Uploader::Base
  storage => :url
end

CarrierWave.configure do |config|
  config.fog_credentials = {
    :provider               => 'AWS',
    :aws_access_key_id      => ENV['AWS_ACCESS_KEY_ID'],
    :aws_secret_access_key  => ENV['AWS_SECRET_ACCESS_KEY']
  }
  config.fog_directory = 'descartes-fog-test'
end
