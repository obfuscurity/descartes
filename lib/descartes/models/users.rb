
class NilClass
  def method_missing(name, *args, &block)
  end
end

class Sequel::Model
end

class User < Sequel::Model

  plugin :validation_helpers

  def validate
    super
    validates_presence :uid
  end

  def before_create
    super
    self.preferences = {:favorites => []}.to_json
    self.token = SecureRandom.hex(32)
    self.created_at = Time.now
    self.updated_at = Time.now
  end

  def before_update
    super
    self.updated_at = Time.now
  end

  def self.find_or_create_by_uid(user)
    User.filter(:uid => user['uid']).first or User.new(:uid => user['uid'], :email => user['email']).save
  end

  def favorites
    JSON.parse(self.preferences)['favorites']
  end

  def add_favorite(uuid)
    preferences = JSON.parse(self.preferences)
    preferences['favorites'].push(uuid).uniq!
    self.preferences = preferences.to_json
    self.save
  end

  def remove_favorite(uuid)
    preferences = JSON.parse(self.preferences)
    preferences['favorites'].delete_if {|f| f === uuid}
    self.preferences = preferences.to_json
    self.save
  end

  def self.remove_favorite_for_everyone(uuid)
    User.where(Sequel.like(:preferences, "%#{uuid}%")).all.each do |user|
      User[user.id].remove_favorite(uuid)
    end
  end
end
