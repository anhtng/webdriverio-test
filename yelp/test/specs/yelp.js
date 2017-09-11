var debug = require('debug');
var assert = require('assert');

var util = require('util'),
    events = require('events');

//var CustomReporter = function(options) {
//    options.cid=100;
//    options.capabilities}=200;
//};

var search1 = "Restaraunts";
var search2 = "pizza";
var config = require('config')
var mainScr = config.get("screens.main");
if (mainScr != null) {
    search1 = mainScr.get("searches")[0];
    search2 = mainScr.get("searches")[1];
}

if (config.browser == null) config.browser = 'chrome';
var program = require('commander');
program
  .version('0.1.0')
  .option('-m --search1 [main]', 'Main search category',search1) 
  .option('-s --search2 [secondary]', 'Add secondary search string',search2) 
  .option('-h --headless <browser>', 'Run as head less',config.headless) 
  .option('-b --browser [browser]', 'Run as head less',config.browser) 
  .parse(process.argv);
search1 = program.search1;
search2 = program.search2;

var hash = require('node-object-hash');
var options = {};
if (program.browser != null ) {
   options.browserName = program.browser;
}
var path = "";
if (program.headless != null) {
    program.browser = program.headless;
    path = config.browsers.find(o => o.name === program.browser).headlessPath[process.platform];
    if (path != null) {
        options.browserName = program.headless;
        options.desiredCapabilities = {
            binary : path,
            args : ['headless','disabled-gnua']
        }
    }
}
console.log("platflorm="+process.platform+" headlessPath="+path);

var searchResult = "";
describe('yelp.com page', function() {
    it('should have the right title - the fancy generator way', function () {
        //browser.remote(options);
        browser.url(config.get("url"));
        var title = browser.getTitle();
        assert.ok(title.indexOf('Restaurants, Dentists, Bars, Beauty Salons, Doctors - Yelp') > -1,'You are not on Yelp home page');
    });
    var xpathFilters = mainScr.get("fields.filters.xpath");
    it('Search by category', function () {
        var search = search1 + ' - ';
        if (browser.isExisting('.homepage-hero_link='+search1) ) {
            browser.click('.homepage-hero_link='+search1);
            browser.waitForVisible(mainScr.get("fields.resultsSummary.xpath"),5000);
            assert.equal(browser.getTitle().indexOf('The Best 10 '+search1),0,'You are not on Yelp '+search1+' result page.  '+browser.getTitle());
        }
        else if (browser.isExisting('input#find_desc') ) {
            console.log("Link "+search1+ " does not exists.  Will use input box for ", browser.getValue('input#find_desc') + " search");
            browser.setValue('input#find_desc', search1+"\n");
            browser.click('#header-search-submit');
            assert.ok(browser.getTitle().indexOf(search1) > 0,'You are not on Yelp '+search1+' result page.  '+browser.getTitle());
        }
        else {
            console.error("Cannot search by " + search1);
        }
    });
    it('Search by description', function () {
        var search = search1 + ' - ' + search2;
        browser.setValue('input#find_desc', search);
        browser.click('#header-search-submit');
        browser.waitUntil(function () {
            return browser.getTitle().indexOf('Best '+search) == 0;
        }, 10000, 'expected page to be ' + search + ' in 10s');
        assert.equal(browser.getTitle().indexOf('Best '+search),0,'You are not Yelp ' + search + ' result page');
        var elem = browser.element('[name="find_loc"]');
        console.log("Search location is "+browser.getValue('[name="find_loc"]'));
        browser.waitForVisible(xpathFilters,10000);
        browser.click(xpathFilters);
        searchResult = browser.getText('.pagination-results-window')
    });
    it('Do Filters', function () {
        mainScr.get("filters").forEach(function(filter) {
            console.log("Applying filter '"+filter.name+"'");
            browser.click(filter.xpath);
            browser.waitUntil(function () {
                return browser.getText('.pagination-results-window') !== searchResult;
            }, 10000, 'Filter price is not getting selected.');
            searchResult = browser.getText('.pagination-results-window');
        });
    });
    it('What is results', function() {
        browser.waitForVisible(mainScr.get("fields.resultsSummary.xpath"),5000);
        searchResult = browser.getText('.pagination-results-window');
        // Look for number of results found in 'Showing 1-10 of 1725'
        var nFound = /Showing\s+\d+\-(\d+)\s+of\s+(\d+)/.exec(searchResult);
        assert.ok(nFound.length > 1,'The number of results found is not greater than zero');
        console.log('There are '+nFound[2]+' places found from search');
        console.log('Current page has '+nFound[1]+' records');
    });
    it('First page results star rating', function() {
        var results = browser.elements(mainScr.get("fields.resultsContent.xpath"))
        console.log("Number of records found " + results.value.length);
        var i = 0;
        results.value.forEach(function(elem){
           var bzname = i + " UNKNOW BUSINESS NAME";
           if (elem.isExisting('.biz-name') ) {
               bzname = elem.element('.biz-name').getText('span');
           }
           var rate = "NO STAR";
           if (elem.isExisting('.i-stars') ) {
               rate = elem.element('.i-stars').getAttribute('title');
           }
           console.log("Rating for "+bzname+" is "+rate);
           i++;
        });
    });
    var detailScr = config.get("screens.detail");
    it('Get item Detail', function() {
        var elem = browser.element(mainScr.get("fields.resultsContent.xpath") + '[1]');
        var bznameElem = elem.element('.biz-name');
        var bzname = bznameElem.getText('span');
        bznameElem.click();
        browser.waitUntil(function () {
            return browser.getTitle().indexOf(bzname) == 0;
        }, 10000, 'Detail page is not getting load.');
        assert.equal(browser.getTitle().indexOf(bzname),0,'You are not at '+bzname+' page.');
        console.log('\n<results><item name="'+bzname+'">');
        console.log("  <website>"+browser.getText('.biz-website','a')+"</website>");
        console.log("  <phone>"+browser.getText('.biz-phone','span')+"</phone>");
        console.log("  <address>");
        console.log(browser.getText('.street-address','address'));
        console.log("  </address>");
        browser.waitUntil(function () {
            return browser.elements(detailScr.get("fields.reviews.xpath")).value.length > 3;
        }, 5000, 'Number of reviews is not greater than 3.');
        var reviews=browser.elements(detailScr.get("fields.reviews.xpath"));
        var i=0;
        console.log("  <reviews>");
        reviews.value.forEach(function(elem){
           if (i > 0 && i < 4) {
               var userElem = elem.element('li.user-name');
               console.log('        <item user="'+userElem.getText() + '">' );
               var rev = elem.element(detailScr.get("fields.reviewText.xpath"));
               console.log(rev.getText());
               console.log("        </item>");
           }
           i++;
        });
        console.log("  </reviews>");
        console.log("</item></results>");
    });
});
