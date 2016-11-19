ty3status
=========

ty3status is a replacement for i3status, py3status, or i3blocks. ty3status is written in typescript with first class
support for javascript blocks, but allows for blocks to be written in any language. 

ty3status was written to facilitate a performant way to use javascript to write blocks for your i3bar. It has since
expanded to include features from many other status line programs.

- "Module" blocks - blocks written in javascript.
- "Legacy" blocks - reuse already written blocks from other status line programs like i3status or i3blocks.
- "Persistent" blocks - long running programs which occasionally output information.
- Color support
- i3-gaps background and border support
- UTF-8 compatible
- Pango compatible


## Quick Getting Started

Install ty3status.

    git clone https://github.com/mrkmg/ty3status.git /tmp/ty3status && \
    cd /tmp/ty3status && \
    git checkout $(git describe --long --tags) && \
    (yarn || npm install) && \
    npm run build && \
    sudo npm run system-install

Change your status line program in your i3 config to ty3status.

    ...
    status_command ty3status --config /path/to/config
    ...    

Create a ty3status config file for your user account.

    cp /etc/ty3bar.yaml ~/.config/ty3status.yaml
    
Modify the file as needed, then restart i3.


## Documentation

- [Installation](./docs/Installation.md)
- [Configuration](./docs/Configuration.md)
- [Example Configurations](./docs/Example-Configurations.md)
- [Built in Modules](./docs/Built-in-Modules.md)
- [External Modules](./docs/External-Modules.md)
- [Writing a Module](./docs/Writing-a-Module.md)
- [Contributing](./docs/Contributing.md)

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
