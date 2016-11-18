ty3status - Example Configurations
==================================

Below are some example configurations you can use.
[TOC]: # 
# Table of Contents
- [Default Configuration](#default-configuration)
- [i3-gaps with borders](#i3-gaps-with-borders)


## Default Configuration

```yaml
defaults:
  ignoreError: true
  markup: pango

blocks:
- type: module
  module: cpu-usage
  interval: 5
  prefix: 'CPU: '
  separator: false

- type: module
  module: loadavg
  interval: 5
  params:
    o15: false

- type: module
  module: memory
  interval: 30

- type: module
  module: datetime
  color: "#FFFFFF"
```

## i3-gaps with borders

![i3-gaps-borders](./img/i3-gaps-borders.png)

```yaml
defaults:
  ignoreError: true
  markup: pango
  color: "#CCCCCC"
  borderBottom: 2
  separatorWidth: 30

blocks:
- type: module
  module: cpu-usage
  interval: 5
  prefix: "<span color='#FF0000'>CPU: </span>"
  border: "#FF0000"

- type: module
  module: loadavg
  interval: 5
  prefix: "<span color='#00FF00'>LOAD: </span>"
  border: "#00FF00"
  params:
    o15: false

- type: module
  module: memory
  interval: 30
  prefix: "<span color='#48aef2'>MEM: </span>"
  border: "#48aef2"

- type: module
  module: datetime
  prefix: "<span color='#FFFFFF'>DATE: </span>"
  border: "#FFFFFF"

```

More to come!
