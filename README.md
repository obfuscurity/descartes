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

This product would consist of a simple Sinatra application serving up Javascript libraries for creating charts, saving configurations, and interacting with external services like the Graphite API. Third-party libraries will be reused wherever possible, particularly those related to chart and DOM manipulation. Examples:

* jQuery
* D3.js
* Rickshaw

