# webdriverio-test

# Related Links:
# http://webdriver.io/
# http://webdriver.io/guide.html

# Setup:
npm install config
npm install js-yaml
npm install nodejs-config

npm install selenium-webdriver
# Install Chrome driver https://sites.google.com/a/chromium.org/chromedriver/downloads

npm install webdriverio
brew install geckodriver

# Install selenium server http://docs.seleniumhq.org/download/

Launcn Selenium Server:
# java -jar selenium-server-standalone-3.5.2.jar
java -jar -Dwebdriver.gecko.driver=/Users/anguyen/node_modules/geckodriver selenium-server-standalone-3.5.2.jar

# Run Tests:
cd yelp

# Run test with config/yelp.yml
NODE_ENV=yelp
~/node_modules/.bin/wdio wdio.conf.js
# Override search parameters in wdio.conf.js
NODE_ENV=yelp
~/node_modules/.bin/wdio wdio.conf.js --search2=chinese
~/node_modules/.bin/wdio wdio.conf.js --search1=Home --search2=alarm
