var newman = require('newman'); // require newman in your project
const util = require('util')
var fs = require('fs');
var XMLWriter = require('xml-writer');
var ws;
var debug;
var xw = new XMLWriter(false, function(string, encoding) {
    ws.write(string, encoding);
});
var iTest = 0;
var spaces = "";
var systemOut;

// call newman.run to pass `options` object and wait for callback
newman.run({
    collection: require('./Yelp.postman_collection.json'),
    reporters: ['cli','junit','json','html'],
    environment: require('./Yelp Enterpise V3.postman_environment.json')
}).on('start', function (err, args) {
    debug = fs.createWriteStream('debug.yaml');
    ws = fs.createWriteStream('debug.xml');
    if (ws) {
        xw.startDocument();
        xw.startElement('testsuites');
        xw.writeAttribute('name','Yelp');
    }
}).on('console', function (err, args) {
    if (ws) {
        systemOut.writeElement(args.level,args.messages[0]); 
    }
}).on('beforeTest', function (err, args) {
    if (ws) {
        xw.startElement('testsuite');
// ("000"+iTest++).slice(-4)+'_'+
//        xw.writeAttribute('name',args.item.name.replace(/\s/g,'_'));
        xw.writeAttribute('name',args.item.name);
        systemOut = new XMLWriter;
        systemOut.startElement('system-out');
    }
}).on('request', function (err, args) {
    if (debug) {
        debug.write("Anh request\n");
//        debug.write(util.inspect(args, false, null));
    }
}).on('script', function (err, args) {
    if (debug) {
        debug.write("Anh script\n");
        debug.write(util.inspect(args, false, null));
    }
}).on('iteration', function (err, args) {
    if (debug) {
        debug.write("Anh iteration\n");
//        debug.write(util.inspect(args, false, null));
    }
}).on('test', function (err, args) {
    if (debug) {
        debug.write("Anh test\n");
//        debug.write(util.inspect(args, false, null));
    }
    if (ws) {
        args.executions.forEach(function(c) {
            xw.writeElement('rc', c.result.response.code);
        });
        systemOut.endElement('system-out');
        xw.writeRaw(systemOut);
        xw.endElement('testsuite');
    }
}).on('done', function (err, args) {
    if (ws) {
        xw.endElement('testsuite');
        xw.endElement('testsuites');
        xw.endDocument();
        ws.end();
    }
    if (debug) {
        debug.end();
    }
});


