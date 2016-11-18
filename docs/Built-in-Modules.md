ty3status - Built in Modules
============================

ty3status ships with a variety of simple blocks. They are designed to be simple, and not require any external dependencies.
To use a built in module, specify the module name as the `module` property of a block.

[TOC]: # 
# Table of Contents
- [battery](#battery)
- [cpu-usage](#cpu-usage)
- [datetime](#datetime)
- [loadavg](#loadavg)
- [memory](#memory)
- [uptime](#uptime)

### battery

Displays the current state of the battery. Shows an icon of the battery state, percentage, and time remaining to full
charge or time left until full discharge. Uses UPower to retrieve the data and monitor for state changes (plugging in or
unplugging). It also supports [FontAwesome](http://fontawesome.io/). If you have FontAwesome installed on your machine,
you can use beautiful icons to represent the battery level. Make sure to set markup to pango if using FontAwesome.

Params:

- chargingIcon - Text to use when charging.
- dischargingIcon - Text to use when discharging.
- chargedIcon - Text to use when fully charged.
- fontAwesome - Use font awesome icons instead of the above options.
- urgentLevel - Percentage of battery left to make the block show urgency.


```yaml
- type: module
  module: battery
  interval: 300
  params:
    chargingIcon: C
    dischargingIcon: D
    chargedIcon: G
    fontAwesome: false
    urgentLevel: 10
```

### cpu-usage

Displays processor usage as a percentage. The percentage is a reflection of processor time used since the last interval.
If your have the interval set for 5 seconds, each update will show the percentage of the previous 5 seconds.

```yaml
- type: module
  module: cpu-usage
  interval: 5
```

### datetime

Displays the current date and time. The format is displayed using the formatting options defined in
[node-dateformat](https://github.com/felixge/node-dateformat#mask-options)

```yaml
- type: module
  module: datetime
  params:
    format: "ddd mmm dd yyyy h:MM:ss TT"
```    
        
### loadavg

Displays the 1, 5, and 15 minute load averages. You can define which averages to show, and the number of decimal places
to show.

```yaml
- type: module
  module: loadavg
  params:
    o1: true
    o5: true
    o15: false
    precision: 2
```

### memory

Displays the current memory usage of the system. On linux system, this number is calculated from /proc/meminfo. On every
other system the number is calculated from Nodes OS memory functions.

```yaml
- type: module
  module: memory
```

### uptime

Displays the amount of time the system has been up. Output can either show seconds, or hide seconds.

```yaml
- type: module
  module: uptime
  interval: 1
  params:
    showSeconds: true
```
