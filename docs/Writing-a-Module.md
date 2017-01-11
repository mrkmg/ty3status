ty3status - Writing a Module
============================

A module only has a few requirements.

A ty3status module must export a single function, which takes 2 arguments.

    module.exports = function (dataCallback, config) {}
    
- *dataCallback* - a function that should be called every time the block should be updated. The dataCallback function
  must be called with an object with the following properties.
    - *full_text* (required) - a string that contains what should show in the block.
    - *short_text* (optional) - a string that contains a shortened version of the full_text.
    - *color* (optional) - the color the make the text in the block.
- *config* - An object containing all the configuration options set for this block.
  [Possible Options](Configuration.md#ty3status-config).
    
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

It is best practice to assume your module will have multiple instances. Because of this, you should take special care to
make sure that all variables related to the specific instance are not global in the module.

This fact can also be used to share instances to the same underlying system.
