# webdriverio-test

# Related Links:
# http://webdriver.io/
# http://webdriver.io/guide.html

# Setup:
export PREFIX="--prefix ."
npm install $PREFIX config 
npm install $PREFIX js-yaml
# npm install nodejs-config
npm install $PREFIX commander
npm install $PREFIX selenium-webdriver
npm install $PREFIX webdriverio


# Install Chrome driver https://sites.google.com/a/chromium.org/chromedriver/downloads

# Install selenium server http://docs.seleniumhq.org/download/

Launcn Selenium Server:
brew install geckodriver
# java -jar selenium-server-standalone-3.5.2.jar
java -jar -Dwebdriver.gecko.driver=geckodriver selenium-server-standalone-3.5.2.jar

# Run Yelp tests:
cd yelp
# Run test with config/yelp.yml
NODE_ENV=yelp
../node_modules/.bin/wdio wdio.conf.js
# Override search parameters in wdio.conf.js
NODE_ENV=yelp
../node_modules/.bin/wdio wdio.conf.js --search2=chinese
../node_modules/.bin/wdio wdio.conf.js --search1=Home --search2=alarm
