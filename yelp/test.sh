#!/bin/sh

# API tests
node collections/run.js
mv newman/* debug.xml reports

NODE_ENV=yelp ../node_modules/.bin/wdio wdio.conf.js --spec ./test/specs/yelp.js
mv reports/results-0-0.chrome.xml reports/pizza-0-0.chrome.xml
NODE_ENV=yelp ../node_modules/.bin/wdio wdio.conf.js --search2=chinese --spec ./test/specs/yelp.js
mv reports/results-0-0.chrome.xml reports/chinese-0-0.chrome.xml
NODE_ENV=yelp ../node_modules/.bin/wdio wdio.conf.js --search1=Home --search2=alarm --spec ./test/specs/yelp.js
mv reports/results-0-0.chrome.xml reports/homeAlarm-0-0.chrome.xml
set +e
NODE_ENV=yelp ../node_modules/.bin/wdio wdio.conf.js --search1=Carasdf --search2=alarm --spec ./test/specs/yelp.js
set -e

