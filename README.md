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

### Options

Currently the only optional environment variable is `USE_SVG` which, when set to `true`, will cause Descartes to load SVG output from Graphite instead of the default PNG output. In the future SVG will become the default format, but there is currently a bug in stable Graphite (0.9.10 as of this writing) which causes SVG rendering to fail whenever `secondYAxis` is enabled on any target in a graph.

* `USE_SVG`

### Sessions and Authorization

The default session cookie should be randomized by setting `SESSION_SECRET` to a random string.

Descartes provides organizational authorization using either Google OpenID or GitHub OAuth.
The `OAUTH_PROVIDER` environment variable can be set to either `google` or `github` to
determine which type to use.

Based on `OAUTH_PROVIDER`, some additional environment variables must be set:

#### Google OpenID

* `GOOGLE_OAUTH_DOMAIN`

#### GitHub OAuth

A new GitHub application will need to be [registered](https://github.com/settings/applications/new). The Main and Callback URLs should be the URL of your application.

* `GITHUB_CLIENT_ID`
* `GITHUB_CLIENT_SECRET`
* `GITHUB_ORG_ID` (The name of your organization)

### Development

```bash
$ rvm use 1.9.2
$ bundle install
$ export OAUTH_PROVIDER=...
$ export <auth provider tokens>=...
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
$ heroku config:set -r $DEPLOY OAUTH_PROVIDER=...
$ heroku config:set -r $DEPLOY <auth provider tokens>=...
$ heroku config:set -r $DEPLOY GRAPHITE_URL=...
$ heroku config:set -r $DEPLOY SESSION_SECRET...
$ heroku config:set -r $DEPLOY RAKE_ENV=production
$ git push $DEPLOY master
$ heroku scale -r $DEPLOY web=1
$ heroku open -r $DEPLOY
```

## LICENSE

Descartes is distributed under the MIT license. Third-party software libraries included with this project are distributed under their respective licenses.
