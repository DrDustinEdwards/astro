---
layout: ../layouts/Page.astro
title: Charts in Markdown
enhance: true
---

A chart in Markdown is a code block whose language is `chart`: options, a line of three dashes, then the data.

```chart
type: bar
x: team
y: tickets
series: status
layout: grouped
title: Tickets by team
alt: Support has the most open tickets; Platform has closed the most.
interactive: true
---
team,status,tickets
Support,Open,14
Support,Closed,22
Platform,Open,5
Platform,Closed,31
Web,Open,8
Web,Closed,17
```
