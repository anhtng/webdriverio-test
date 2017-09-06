var assert = require('assert');

var search1 = "Restaraunts";
var search2 = "pizza";
var config = require('config')
var mainScr = config.get("screens.main");
if (mainScr != null) {
    search1 = mainScr.get("categories")[0];
    search2 = mainScr.get("categories")[1];
}

for (var index in process.argv) {
    var str = process.argv[index];
    if (str.indexOf("--search1") == 0) {
        search1 = str.substr(10);
    }
    else if (str.indexOf("--search2") == 0) {
        search2 = str.substr(10);
    }
}

var searchResult = "";
describe('yelp.com page', function() {
    it('should have the right title - the fancy generator way', function () {
        browser.url(config.get("url"));
        var title = browser.getTitle();
        assert.equal(title, 'San Jose Restaurants, Dentists, Bars, Beauty Salons, Doctors - Yelp','You are not on Yelp home page');
    });
    var xpathFilters = mainScr.get("fields.filters.xpath");
    it('Search by category', function () {
        if (browser.isExisting('.homepage-hero_link='+search1) ) {
            browser.click('.homepage-hero_link='+search1);
            browser.waitForVisible(mainScr.get("fields.resultsSummary.xpath"),5000);
            assert.equal(browser.getTitle().indexOf('The Best 10 '+search1),0,'You are not Yelp Restaurants result page');
        }
        browser.waitForVisible(xpathFilters,5000);
        browser.click(xpathFilters);
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
        searchResult = browser.getText('.pagination-results-window')
    });
    it('Add Filter Price', function () {
        var field = mainScr.get("fields.price");
        var val = field.get("value");
        var xpath = field.get("xpath");
        var elem = $('input[value="'+val+'"]');
        browser.click(xpath);
        browser.waitUntil(function () {
            return browser.getText('.pagination-results-window') !== searchResult;
        }, 10000, 'Filter price is not getting selected.');
        searchResult = browser.getText('.pagination-results-window');
    });
    it('Add Filter Feature', function () {
        var field = mainScr.get("fields.feature");
        var val = field.get("value");
        var xpath = field.get("xpath");
        var elem = $('input[value="'+val+'"]');
        browser.click(xpath);
        browser.waitUntil(function () {
            return browser.getText('.pagination-results-window') !== searchResult;
        }, 10000, 'Filter price is not getting selected.');
        searchResult = browser.getText('.pagination-results-window');
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
        console.log("Number of records found " + results.length);
        var i = 0;
        results.value.forEach(function(elem){
           var bzname = i + " UNKNOW BUSINESS NAME";
           if (elem.isExisting('.biz-name') ) {
               bzname = elem.element('.biz-name').getText('span');
           }
           var rate = "NO STAR";
           if (elem.isExisting('.i-stars') ) {
               rate = elem.element('.i-stars');
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
