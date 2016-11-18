ty3status - Configuration
=========================

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
- **background** (hex_color) - Set the background color.
- **border** (hex_color) - *i3-gaps only* - Set the border color.
- **borderBottom** (number) - *i3-gaps only* - Set size of the bottom border.
- **borderLeft** (number) - *i3-gaps only* - Set size of the left border.
- **borderRight** (number) - *i3-gaps only* - Set size of the right border.
- **borderTop** (number) - *i3-gaps only* - Set size of the top border.

The config has two sections, `defaults` and `blocks`, as well a global configuration options. Defaults will be applied
as the default properties for all blocks. Blocks is a list of the blocks, in order, that you want to be displayed. 

The global options are:

- **outputSpeedLimit** *500* (milliseconds) - The minimum amount of time to wait between refreshing the bar. Useful to
  prevent blocks from updating the bar to quickly and causing cpu usage spikes in i3bar.

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

Module blocks are blocks which are written in javascript. There are a number of modules
[built in](./Built-in-Modules.md). You may also use [user-contributed](./External-Modules.md) modules as well.

