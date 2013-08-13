var assert = require('assert')
  , soda = require('soda')
  , seleniumLauncher = require('../lib/selenium-launcher')
  , wd = require('wd')

describe("sanity", function(){

  it("should be sane", function(done){
    seleniumLauncher(function(er, selenium) {
      if (er) return done(er)
      selenium.on('exit', function() { done() })

      soda.createClient({
        url: 'http://www.facebook.com/',
        host: selenium.host,
        port: selenium.port,
      })
      .chain
      .session()
      .setTimeout(5000)
      .open('/')
      .waitForPageToLoad(2000)
      .waitForTextPresent('Email')
      .assertTextPresent('Email')
      .testComplete()
      .end(function() {
        selenium.kill()
      })
    })
  });

  it("should be sane with chrome and stuff", function(done){
    seleniumLauncher({ chrome: true }, function(er, selenium) {
      if (er) return done(er)
      selenium.on('exit', function() { done() })

      var browser = wd.promiseRemote(selenium.host, selenium.port );

      browser.init({ browserName: 'chrome' }, function(err){
        if( err ) throw new Error(err);

        browser.get('http://google.com')
          .then(function () {
            return browser.elementByName('q');
          })
          .then(function (el) {
            searchBox = el;
            return searchBox.type('webdriver');
          })
          .then(function () {
            return searchBox.getAttribute('value');
          })
          .then(function (val) {
            return assert.equal(val, 'webdriver');
          })
          .then(function(){
            selenium.kill();
            done();
          });
      });

    });
  });


  it('should get the server port from the node environment', function(done) {
    process.env.SELENIUM_LAUNCHER_PORT = '4444'
    seleniumLauncher(function(er, selenium) {
      delete process.env.SELENIUM_LAUNCHER_PORT
      if (er) return done(er);
      assert.equal(selenium.port, 4444);
      selenium.on('exit', function() { done() })
      selenium.kill()
    })
  });

});
