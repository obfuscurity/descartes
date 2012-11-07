web: bundle exec rackup -p $PORT -s thin
scheduler: bundle exec rake resque:scheduler QUEUE=*
worker: bundle exec rake resque:work QUEUE=*
