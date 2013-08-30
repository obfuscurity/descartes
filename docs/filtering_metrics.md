# Filtering metrics

The metrics tab lets you filter your available metrics to create graphs
of what you are interested in.

When you type into the filter field it will search the cache and display
matching metrics. You can either search for matching strings in metrics,
or you can use wildcards with `.*`.

For example, the carbon cache will send metrics about how it's performing.
You can filter for these metrics by entering `carbon` into the search
field. This will match any mention of `carbon` in your collected metrics.

If you have several agents and you wanted to display a single metric for
them all, say `avgUpdateTime` you can use the `.*` wildcard and enter
`carbon.*avgUpdateTime`.

If the metrics you are searching for aren't displaying then they might
not be in the cache yet. The update time for the cache is displayed at
the top of the page. You can restart descartes to update the cache, or
you can change the `METRICS_UPDATE_INTERVAL` value (see the
[options](https://github.com/obfuscurity/descartes#options)).
