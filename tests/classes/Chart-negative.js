/*
  Copyright 2013 Weswit Srl

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
define([weswitClassPrefix+"Chart",weswitClassPrefix+"SimpleChartListener","./HtmlTest","weswit/Inheritance","weswit/ASSERT"],
    function(Chart,SimpleChartListener,HtmlTest,Inheritance,ASSERT) {
   
  var testLogger = HtmlTest.testLogger;
  
  HtmlTest.createCSS("Chart");
   
  var ChartTest = function(forceDiv) {
    this._callSuperConstructor(ChartTest,["Chart"]);
    this.forceDiv = forceDiv;
  };
  
  ChartTest.getInstances = function() {
    return [new ChartTest(false),new ChartTest(true)];
  };
  
  ChartTest.prototype = {
    toString: function() {
      return "[ChartTest-negative]";
    },
    
    start:function() {
      this._callSuperMethod(ChartTest,"start");
      this.write('<div data-source="lightstreamer" id="container"></div>');
   
      
      myChart = new Chart("container");
      if (myChart.forceDivPainting) {
        //not available on minified version
        ASSERT.verifySuccess(myChart,"forceDivPainting",[this.forceDiv],ASSERT.VOID);
      }
      

      
      var labels = false;
      myChart.addListener({
          onNewLine: function(key,newChartLine,nowX,nowY) {
            if (!labels) {
              ASSERT.verifySuccess(newChartLine,"setYLabels",[5,"lbl"],ASSERT.VOID);
              labels = true;
            }
            ASSERT.verifySuccess(newChartLine,"positionYAxis",[-250,250],ASSERT.VOID);
          }
        
      });
      
      
      var autoZoom = new SimpleChartListener();
      autoZoom.onNewLine = null;
      myChart.addListener(autoZoom);
      
      ASSERT.verifySuccess(myChart,"configureArea",["chartStyle",500,500,200,200],ASSERT.VOID);

      ASSERT.verifySuccess(myChart,"setXAxis",["X"],ASSERT.VOID);
      ASSERT.verifySuccess(myChart,"addYAxis",["Y1"],ASSERT.VOID);
      ASSERT.verifySuccess(myChart,"addYAxis",["Y2"],ASSERT.VOID);
      
      ASSERT.verifySuccess(myChart,"positionXAxis",[-250,250],ASSERT.VOID);
      ASSERT.verifySuccess(myChart,"setXLabels",["5","lbl"],ASSERT.VOID);
      
      ASSERT.verifySuccess(myChart,"updateRow",["k1",{"X":-250,"Y1":125,"Y2":-125}],ASSERT.VOID);
      ASSERT.verifySuccess(myChart,"updateRow",["k1",{"X":-125,"Y1":125,"Y2":-125}],ASSERT.VOID);
      ASSERT.verifySuccess(myChart,"updateRow",["k1",{"X":0,"Y1":0,"Y2":0}],ASSERT.VOID);
      ASSERT.verifySuccess(myChart,"updateRow",["k1",{"X":125,"Y1":125,"Y2":-125}],ASSERT.VOID);
      ASSERT.verifySuccess(myChart,"updateRow",["k1",{"Y1":135,"Y2":-135}],ASSERT.VOID);
      ASSERT.verifySuccess(myChart,"updateRow",["k1",{"X":135}],ASSERT.VOID);
      ASSERT.verifySuccess(myChart,"updateRow",["k1",{"X":250,"Y1":-250,"Y2":250}],ASSERT.VOID);
    
      
     
      var that = this;
      setTimeout(function() {
       ASSERT.verifySuccess(myChart,"clean",ASSERT.VOID,ASSERT.VOID);
        
       that.end();
      },1000);
    }
  };
  
  Inheritance(ChartTest,HtmlTest);
  return ChartTest;
  
});