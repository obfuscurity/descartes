
class NilClass
  def method_missing(name, *args, &block)
  end
end

class Sequel::Model
end

CarrierWave.configure do |config|
  config.fog_credentials = {
    :provider               => 'AWS',
    :aws_access_key_id      => ENV['AWS_ACCESS_KEY_ID'],
    :aws_secret_access_key  => ENV['AWS_SECRET_ACCESS_KEY']
  }
  config.fog_directory = ENV['S3_DIRECTORY']
end

class Uploader < CarrierWave::Uploader::Base
  storage :fog
end

class Gist < Sequel::Model

  many_to_one :graphs
  
  plugin :boolean_readers
  plugin :prepared_statements
  plugin :prepared_statements_safe
  plugin :validation_helpers

  mount_uploader :url, Uploader

  def before_create
    super
    self.uuid = SecureRandom.hex(16)
    self.created_at = Time.now
  end
end
