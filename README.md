# Descartes

[![Build Status](https://secure.travis-ci.org/obfuscurity/descartes.png)](http://travis-ci.org/obfuscurity/descartes)

![dashboard](https://github.com/obfuscurity/descartes/raw/master/lib/descartes/public/img/descartes.png "Descartes")

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

### Service Dependencies

* PostgreSQL
* Redis

### Options

* `METRICS_UPDATE_INTERVAL` - How frequently to update the list of known metrics from the remote Graphite server. The more often you add new metrics, the lower this value should be. A reasonable default for most installations would be `1h` (time strings as understood by [Rufus scheduler](https://github.com/jmettraux/rufus-scheduler#the-time-strings-understood-by-rufus-scheduler)). If users complain that they don't see new metrics, it means that it hasn't synced since a new metric has been added. You can simply restart Descartes, and optionally lower this value to suit your users' patience threshold, to manually update the metrics list.

* `METRICS_UPDATE_ON_BOOT` - Determines whether the list of known metrics should attempt to be loaded from the remote Graphite server at startup. Large metric stores can cause a significant delay here, so some users may wish to disable by setting `false` here.

* `METRICS_UPDATE_TIMEOUT` - The timeout value for downloading the metrics list. Defaults to `300` seconds.

* `USE_SVG` - When set to `true`, will cause Descartes to load SVG output from Graphite instead of the default PNG output. In the future SVG will become the default format, but there is currently a bug in stable Graphite (0.9.10 as of this writing) which causes SVG rendering to fail whenever `secondYAxis` is enabled on any target in a graph.

* `GRAPH_TEMPLATE` - Specify the [Graphite graph template](https://graphite.readthedocs.org/en/latest/render_api.html?#template) to use when rendering graphs.

### Sessions and Authorization

The default session cookie should be randomized by setting `SESSION_SECRET` to a random string.

If your Graphite web server requires Basic Authentication, these credentials can be set using the `GRAPHITE_USER` and `GRAPHITE_PASS` environment variables.

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

**Important**: Don't forget to go over to your organization's member page and set yourself as a public
member. This can be found at https://github.com/YOUR-ORG?tab=members (replace YOUR-ORG with your actual
organization name). Once there, ensure that the button says "Conceal membership". If that's the button
you see this means you're already public, otherwise click "Publicize membership".

### Graphite Server Configuration

In order to support CORS with JSON instead of JSONP, we need to allow specific headers and allow the cross-domain origin request. The base URL of your Descartes application will need to be allowed as an origin. The following example is suitable for a test Descartes application running on localhost connecting to a remote Graphite/Apache 2.x server. Adjust as necessary for your environment or webserver.

```
Header set Access-Control-Allow-Origin "http://127.0.0.1:5000"
Header set Access-Control-Allow-Methods "GET, OPTIONS"
Header set Access-Control-Allow-Headers "origin, authorization, accept"
Header set Access-Control-Allow-Credentials true
```

If your Graphite composer is protected by basic authentication, you have to ensure that the HTTP verb OPTIONS is allowed unauthenticated. This looks like the following for Apache:
```
<Location />
    AuthName "graphs restricted"
    AuthType Basic
    AuthUserFile /etc/apache2/htpasswd
    <LimitExcept OPTIONS>
      require valid-user
    </LimitExcept>
</Location>
```

See http://blog.rogeriopvl.com/archives/nginx-and-the-http-options-method/ for an Nginx example.

### Local

Descartes uses the Sinatra web framework under Ruby 1.9. Anyone wishing to run Descartes as a local service should be familiar with common Ruby packaging and dependency management utilities such as RVM and Bundler. If you are installing a new Ruby version with RVM, make sure that you have the appropriate OpenSSL development libraries installed before compiling Ruby.

All environment variables can be set from the command-line, although it's suggested to use `.env` instead. This file will automatically be picked up by foreman, which is also helpful when debugging (e.g. `foreman run pry`). This file will not be committed (unless you remove or modify `.gitignore`) so you shouldn't have to worry about accidentally leaking credentials.

```bash
$ rvm use 1.9.2
$ bundle install
$ createdb descartes
$ cp .env.example .env
$ $EDITOR .env
$ bundle exec rake db:migrate:up
$ foreman start
$ open http://127.0.0.1:5000
```

### Heroku - The Old Way

```bash
$ export DEPLOY=production/staging/you
$ heroku create -r $DEPLOY -s cedar
$ heroku addons:add redistogo -r $DEPLOY
$ heroku addons:add heroku-postgresql:dev -r $DEPLOY
$ heroku config:set -r $DEPLOY OAUTH_PROVIDER=...
$ heroku config:set -r $DEPLOY <auth provider tokens>=...
$ heroku config:set -r $DEPLOY GRAPHITE_URL=...
$ heroku config:set -r $DEPLOY METRICS_UPDATE_INTERVAL=1h
$ heroku config:set -r $DEPLOY SESSION_SECRET...
$ heroku config:set -r $DEPLOY RAKE_ENV=production
$ git push $DEPLOY master
$ heroku run -r $DEPLOY bundle exec rake db:migrate:up
$ heroku scale -r $DEPLOY web=1
$ heroku open -r $DEPLOY
```

### Heroku - The Easy Way

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/obfuscurity/descartes)

## Upgrades

Upgrades are typically performed by updating your in-place copy of the Descartes checkout. If you are using a third-party package, please refer to their upgrade documentation.

### Migrations

Database upgrades (or downgrades) should use the built-in `rake` migration targets. For upgrading to the newest version in your development or non-Heroku production environment:

```bash
$ bundle exec rake db:migrate:up
```

If for some reason you need to downgrade to a previous migration target, make sure to set the `VERSION` number:

```bash
$ bundle exec VERSION=3 rake db:migrate:to
```

If you're running on Heroku, simply prefix the aforementioned commands with `heroku run` (and any other relevant options).

## License

Descartes is distributed under the MIT license. Third-party software libraries included with this project are distributed under their respective licenses.
