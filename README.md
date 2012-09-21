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

## Deployment

Descartes stores configuration data in PostgreSQL and Google OpenID state in Redis. It is assumed you have local PostgreSQL and Redis servers running for local development.

### Dependencies

* PostgreSQL
* Redis

### Development

```bash
$ rvm use 1.9.2
$ bundle install
$ export GOOGLE_OAUTH_DOMAIN=...
$ export GRAPHITE_URL=...
$ export SESSION_SECRET=...
$ createdb descartes
$ bundle exec rake db:migrate:up
$ foreman start
$ open http://127.0.0.1:5000
```

### Production

```bash
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
```
### GitHub™ Auth

If `GOOGLE_OAUTH_DOMAIN` is not set, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and
`GITHUB_ORG_ID`(just the name of your organization) have to be set to use GitHub™ for authentication.

[Register a new application for this here](https://github.com/settings/applications/new).
#### Development

```bash
$ export GITHUB_CLIENT_ID=...
$ export GITHUB_CLIENT_SECRET=...
$ export GITHUB_ORG_ID=...
```
#### Production

```bash
$ heroku config:set -r $DEPLOY GITHUB_CLIENT_ID=...
$ heroku config:set -r $DEPLOY GITHUB_CLIENT_SECRET=...
$ heroku config:set -r $DEPLOY GITHUB_ORG_ID=...
```

## LICENSE

Descartes is distributed under the MIT license. Third-party software libraries included with this project are distributed under their respective licenses.
