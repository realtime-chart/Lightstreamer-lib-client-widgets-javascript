# Testing #

This folder contains the tests for the library.

## Run ##

There are tests that need to connect to a Lightstreamer deployed with the default DEMO adapter set. The url of the server that will be used is 
specified on the index.html (search for TEST_SERVER). The test currently points to the online demo server deployed at push.lightstreamer.com: 
this address should be changed to point to a different server to avoid possible errors resulting in normal operations on such public server.

To run the test on a browser, simply open the index.html file. You should keep an eye on the browser console if available; tests should pass even on IE6.
For better results, deploy the project on a web server and run tests, accessing the page through it.

### See ###

[utility-toolkit-javascript](https://github.com/weswit/utility-toolkit-javascript)
[utility-logging-javascript](https://github.com/weswit/utility-logging-javascript)
[utility-test-javascript](https://github.com/weswit/utility-test-javascript)
