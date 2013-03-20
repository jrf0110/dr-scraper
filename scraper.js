var
  fs    = require('fs')
, jsdom = require('jsdom')

, config = {
    baseUrl: 'http://www.spine-health.com/doctor/us/texas/physician?page='
  , outputFile: './results.js'
  }

, results = []

, currentPage = 0

, getLastName = function(parts){
    parts = parts.split(',')[0].split(' ');
    var current = parts.length - 1;

    while (parts[current].indexOf('.') > -1) current--;

    return parts[current];
  }

, parseResults = function(window){
    var $ = window.$;

    $(function(){
      var $trs = $('.views-table.sticky-enabled.cols-2 tbody tr');

      $trs.each(function(i, tr){
        var
          $tr = $(tr)
        , record = {}
        , parts = $tr.find('a').html()
        ;

        if ($tr.hasClass('quote')) return;
        parts = parts.split(' ').slice(1).join(" ");

        record.lastName = getLastName(parts);

        parts = parts.split(',');

        record.name = parts[0];

        if (record.lastName === "Patel" || record.lastName === "Duffy"){
          record.city = parts[parts.length - 2];
          record.state = parts[parts.length - 1].split(' ')[1];
          record.zip = parts[parts.length - 1].split(' ')[2];
        } else {
          record.city = parts[parts.length - 3];
          record.state = parts[parts.length - 2];
          record.zip = parts[parts.length - 1];
        }

        results.push(record);
      });
    });
  }

, writeResults = function(){
    fs.writeFileSync(config.outputFile, 'module.exports = ' + JSON.stringify(results, true, '  '));
  }

, loop = function(){
    var url = config.baseUrl + currentPage++;

    if (currentPage > 4) return exit();

    jsdom.env(url, ["http://code.jquery.com/jquery.js"], function(errors, window){
      parseResults(window);
      loop();
    });
  }

, exit = function(){
    writeResults();
    process.exit(0);
  }
;

loop();