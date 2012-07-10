# Descartes

## Purpose

Provide an additional level of insight and collaboration that is neither available nor appropriate for a real-time utility such as Tasseo.

## Objectives

Design, build and deploy a dashboard that allows users to correlate multiple metrics in a single chart, review long-term trends across one or more charts, and to collaborate with other users through a combination of annotations and related comment threads. This product should be capable of the following sample tasks:

* Display complex charts (2+ disparate metrics including transformations)
* Group related charts into a single view
* Timeshift charts within the same view
* Import existing graphs from external sources (e.g. Graphite API)
* Modify graphs using native interface tooling (i.e. users should not have to use Graphite Composer to make changes)
* Create new graphs using native interface tooling
* Add notes (annotations) to charts
* Add comments associated with specific annotations
* Serve as official team dashboards for operational/engineering reviews

## Components

* Bootstrap
* jQuery
* D3.js
* Rickshaw
* Sinatra
* Sequel
* PostgreSQL
* Redis

## Deployment

Descartes stores configuration data in PostgreSQL and Google OpenID state in Redis. It is assumed you have local PostgreSQL and Redis servers running for local development.

### Development

$ rvm use 1.9.2
$ bundle install
$ export GOOGLE_OAUTH_DOMAIN=...
$ export GRAPHITE_URL=...
$ export SESSION_SECRET=...
$ createdb descartes
$ bundle exec rake db:migrate:up
$ foreman start
$ open http://127.0.0.1:5000

### Production

$ export DEPLOY=production/staging/you
$ heroku create -r $DEPLOY -s cedar
$ heroku addons:add redistogo -r $DEPLOY
$ heroku addons:add heroku-postgresql:dev -r $DEPLOY
$ heroku config:set -r $DEPLOY GOOGLE_OAUTH_DOMAIN=...
$ heroku config:set -r $DEPLOY GRAPHITE_URL=...
$ heroku config:set -r $DEPLOY SESSION_SECRET...
$ heroku config:set -r $DEPLOY RAKE_ENV=production
$ git push $DEPLOY master
$ heroku scale -r $DEPLOY web=1
$ heroku open -r $DEPLOY

## LICENSE

Descartes is distributed under the MIT license. Third-party software libraries included with this project are distributed under their respective licenses.

