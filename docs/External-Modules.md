ty3status - External Modules
============================

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
