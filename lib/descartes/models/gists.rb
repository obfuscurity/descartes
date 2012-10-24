
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
  config.fog_directory = ENV['S3_BUCKET']
end

class Gist < Sequel::Model

  class Uploader < CarrierWave::Uploader::Base
    include CarrierWave::RMagick

    version :thumb do
      process :resize_to_fill => [300,150]
    end

    storage :fog
    def cache_dir
      File.expand_path('./tmp/uploads')
    end
    
    def store_dir
      model.uuid
    end
  end

  many_to_one :graphs
  
  plugin :boolean_readers
  plugin :prepared_statements
  plugin :prepared_statements_safe
  plugin :validation_helpers

  mount_uploader :image, Uploader

  def validate
    super
    validates_presence :owner
    validates_presence :image
  end

  def before_create
    super
    self.uuid = SecureRandom.hex(16)
    self.created_at = Time.now
  end

  def before_destroy
    super
    self.remove_image!
  end
end
