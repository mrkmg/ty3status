ty3status
======

ty3status is a replacement for i3status, py3status, or i3blocks. ty3status is written in typescript with first class support
for javascript blocks, but allows for blocks to be written in any language.

[TOC]: # 
# Table of Contents
- [Usage](#usage)
    - [i3 Config](#i3-config)
    - [ty3status Config](#ty3status-config)
    - [Block Types](#block-types)
- [ty3status Modules](#ty3status-modules)
    - [Built In Modules](#built-in-modules)
    - [External Modules](#external-modules)
    - [Writing a module](#writing-a-module)
- [Contributing](#contributing)
- [License](#license)


In order to install ty3status, you will need nodejs and npm.

First, clone the repo.

    git clone https://github.com/mrkmg/ty3status.git /tmp/ty3status
    
Navigate to the repo.
 
    cd /tmp/ty3status
    
Install all dependencies.

    npm install

Next, you will need to build the executable.

    npm run build
    
Finally, install the executable into your path.

    sudo npm run install

Thats it!

## Usage

### i3 Config

You will need to update your i3 config to use ty3status instead of i3status. You can do this by adding or changing the
`status_command` to `ty3status`. See the following example.

    bar {
    	status_command ty3status --config /path/to/config
    	position top
    }

### ty3status Config

ty3status uses yaml for its configuration file. A ty3status configuration file defines default for all blocks and then a list
of blocks. A block is one item that is shown in your bar.


**Block**

A block has the following properties:

- **ignoreError** *true* (bool) - If this block errors, should we display the error or not.
- **markup** *null* ("pango" or null) - If you want to use the pango markup.
- **maxRetries** *20* (number) - If the block errors, how many retries before giving up.
- **retryDelay** *1000* (milliseconds) - How long to wait between retries if there is an error.
- **type** ("legacy", "persistent", "module") - The type of block. See [Block Types](#block-types).
- **color** (hex color) - The default color of the block.
- **instance** (string) - The "BLOCK_INSTANCE" environment variable for legacy blocks.
- **interval** *30* (seconds) - How often the block should run. Set to -1 for a single run (do not run on an interval).
- **module** (string) - Either a built-in module or the path to a ty3status module. See [ty3status-modules](#ty3status-modules].
- **params** (key: value object) - Variables to for ty3status modules. Varies based on module.
- **postfix** (string) - A string to be added to the end of the blocks output.
- **prefix** (string) - A string to be added to the beginning of the blocks output.
- **script** (path) - Used for legacy or persistent block types. The path to the script to run.
- **separator** *true* (bool) - Show the separator.
- **separatorWidth** (number) - How wide the separator should be.
- **signal** (SIGNAL) - If ty3status receives the defined signal, the block with be triggered to run.

The config has two sections, `defaults` and `blocks`, as well a global configuration options. Defaults will be applied
as the default properties for all blocks. Blocks is a list of the blocks, in order, that you want to be displayed. 

The global options are:

- **outputSpeedLimit** *500* (milliseconds) - The minimum amount of time to wait between refreshing the bar. Useful to
  prevent many blocks from updating the bar and causing cpu usage spikes in i3bar.

An example config file:

```yaml
outputSpeedLimit: 500

defaults:
  ignoreError: true
  markup: pango
  color: "#DDDDDD"

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

###  Block Types

There are three different block types; legacy, persistent, and module. 

**Legacy**

Legacy blocks are blocks made for either i3status or i3blocks. These blocks behave in exactly the same way as blocks
defined for i3blocks. Below is an example block using the legacy type.

```yaml
- type: legacy
  script: "/usr/lib/i3blocks/iface"
  instance: "enp2s0"
  interval: 60
  prefix: "LAN: "
```   
      
**Persistent**

Persistent blocks are very similar to legacy blocks, except the script that is run is intended to remain running. Every 
time the script outputs to STDOUT, that output is used as the text for the block. A potential use case would be to
collect information from a logfile. See the example below.

```yaml
- type: persistent
  script: "tail -f /path/to/log"
  prefix: "Last Log Line: "
```   
      
**Module**

Module blocks are blocks which are written in javascript. There are a number of modules built in. See
[ty3status Modules](#ty3status-modules) for more information on how to use and write ty3status modules.


## ty3status Modules

### Built In Modules

ty3status ships with a variety of simple blocks. They are designed to be simple, and not require any external dependencies.
To use a built in module, specify the module name as the `module` property of a block.

**battery**

Displays the current state of the battery. Shows an icon of the battery state, percentage, and time remaining to full
charge or time left until full discharge. Uses UPower to retrieve the data and monitor for state changes (plugging in or
unplugging). It also supports [FontAwesome](http://fontawesome.io/). If you have FontAwesome installed on your machine,
you can use beautiful icons to represent the battery level. Make sure to set markup to pango if using FontAwesome.

```yaml
- type: module
  module: battery
  interval: 300
  params:
    chargingIcon: C
    dischargingIcon: D
    chargedIcon: G
    fontAwesome: false
```

**cpu-usage**

Displays processor usage as a percentage. The percentage is a reflection of processor time used since the last interval.
If your have the interval set for 5 seconds, each update will show the percentage of the previous 5 seconds.

```yaml
- type: module
  module: cpu-usage
  interval: 5
```

**datetime**

Displays the current date and time. The format is displayed using the formatting options defined in
[node-dateformat](https://github.com/felixge/node-dateformat#mask-options)

```yaml
- type: module
  module: datetime
  params:
    format: "ddd mmm dd yyyy h:MM:ss TT"
```    
        
**loadavg**

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

**memory**

Displays the current memory usage of the system. On linux system, this number is calculated from /proc/meminfo. On every
other system the number is calculated from Nodes OS memory functions.

```yaml
- type: module
  module: memory
```

**uptime**

Displays the amount of time the system has been up. Output can either show seconds, or hide seconds.

```yaml
- type: module
  module: uptime
  interval: 1
  params:
    showSeconds: true
```

### External Modules

User contributed modules can typically be installed via npm and should be prefixed with "ty3status-module-". For example,
to use the [ty3status weather module](https://github.com/mrkmg/ty3status-module-weather), perform the following steps.

Install ty3status-module-weather globally via npm.

    $ npm install -g ty3status-module-weather
    
Determine the path to your global modules.

    $ npm root -g
    /usr/lib/node_modules
    
Add the module to your config.

```yaml
- type: module
  module: "/usr/lib/node_modules/ty3status-module-weather"
  interval: 600
  params:
    lat: 00.000
    long: -00.000
    key: xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
        
### Writing a module

A module only has a few requirements.

A ty3status module must export a single function, which takes 2 arguments.

    module.exports = function (dataCallback, config) {}
    
- *dataCallback* - a function should be called everytime the block should be updated. The dataCallback function must be
  called with an object with the following properties.
    - *full_text* (required) - a string that contains what should show in the block.
    - *short_text* (optional) - a string that contains a shortened version of the full_text.
    - *color* (optional) - the color the make the text in the block.
- *config* - An object containing all the configuration options set for this block. 
    
The function must return an object with the following properties.

- *start()* - Starts the module. Should start any intervals or timers.
- *stop()* - Stops the module. Should stop any intervals or timers. It is okay to allow any currently running operations
   finish.
- *tick()* - Should run the module once. For example, this would be called if the user sent a signal to the ty3status
   process which triggered this module to refresh.
- *click(button)* - Should handle a user click on the block. Is many cases, this should just refresh the widget, but can
   also be used to open a webpage, open a folder, or launch a program. `button` will be one of the following numbers:
    - 1 - Left Mouse Button
    - 2 - Middle Mouse Button
    - 3 - Right Mouse Button
    - 4 - Scroll Forward
    - 5 - Scroll Backward
    
Below is very simple datetime module.

```javascript
// ty3status-module-simple-datetime.js
module.exports = function (dataCallback, config) {
    var timer;
    var running;
    
    var output = function() {
        dataCallback({
            full_text: Date.now().toString()
        });
    };
    
    return {
        start: function () {
            if (running) return;
            running = true;
            if (config.interval > 0) {
                timer = setInterval(output, config.interval * 1000);
            }
            output();
        },
        stop: function () {
            if (!running) return;
            running = false;
            clearInterval(timer);
        },
        tick: function () {
            output();
        },
        clicked: function (button) {
            output();
        }
    };
};
```

Then in your ty3status configuration, you would add the following to your blocks.

```yaml
- type: module
  module: "/path/to/ty3status-module-simple-datetime.js"
  interval: 1
```

It is best practice to assume your module will be have multiple instances. Because of this, you should take special care
to make sure that all variables related to the specific instance are not global in the module.

## Contributing

ty3status is developed using typescript. For all development tools are installed locally into the package. Everything
needed to develop is defined as npm scripts.

To build ty3status, use `npm run build`.

To build ty3status on every change, use `npm run build-watch`. This will cause ty3status to be rebuilt whenever a file is
changed.

To lint ty3status to ensure a consistent code style, use `npm run lint`. Please run the linter, and fix any issues
described in the output before making a pull request. Any pull request which has linter errors will be rejected.

## License

The MIT License (MIT) 

Copyright (c) 2016 Kevin Gravier

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
