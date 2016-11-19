ty3status - Installation
========================

In order to install ty3status, you will need nodejs and npm.

First, clone the repo.

    git clone https://github.com/mrkmg/ty3status.git /tmp/ty3status
    
Navigate to the repo.
 
    cd /tmp/ty3status
    
Checkout the latest release.

    git checkout $(git describe --long --tags)
    
Install all the dependencies.

    yarn || npm install

Next, you will need to build the executable.

    npm run build
    
Finally, install the executable into your path.

    sudo npm run system-install

That's it!

Now head over to [Configuration](./Configuration.md)
