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

define([weswitClassPrefix+"CellMatrix",weswitClassPrefix+"Cell","./HtmlTest","weswit/Inheritance","weswit/ASSERT","weswit/BrowserDetection"],
    function(CellMatrix,Cell,HtmlTest,Inheritance,ASSERT,BrowserDetection) {
   
  var testLogger = HtmlTest.testLogger;
  
  var CellMatrixTest = function() {
    this._callSuperConstructor(CellMatrixTest);
  };
    
  CellMatrixTest.getInstances = function() {
    return [new CellMatrixTest()];
  };
  

  CellMatrixTest.prototype = {
    toString: function() {
      return "[CellMatrixTest]";
    },
    
    
    start:function() {
      this._callSuperMethod(CellMatrixTest,"start");
      
      
      this.write('<div id="c11"  data-row="r1" data-field="f1" data-source="Lightstreamer">c11 </div>');
      this.write('<div id="c12"  data-row="r1" data-field="f2" data-source="Lightstreamer">c12 </div>');
      this.write('<div id="c21"  data-row="r2" data-field="f1" data-source="Lightstreamer">c21 </div>');
      this.write('<div id="c22a" data-row="r2" data-field="f2" data-source="Lightstreamer">c22a</div>');
      this.write('<div id="c22b" data-row="r2" data-field="f2" data-source="Lightstreamer">c22b</div>');
      this.write('<div id="c31"  data-row="r3" data-field="f1" data-source="Lightstreamer">c31 </div>');
      this.write('<div id="c32"  data-row="r3" data-field="f2" data-source="Lightstreamer">c32 </div>');
      

      if (!CellMatrix.prototype.forEachCell) {
        //currently can't work on the minified version
        this.end();
        return;
      }
      
      //we're going to run a partial test
      
      testLogger.debug("Prepare the matrix");
      
      var cells = Cell.getLSTags(document,["div"]);
      var matrix = new CellMatrix();
      for (var i=0; i<cells.length; i++) {
        ASSERT.verifySuccess(matrix,"addCell",[cells[i]],ASSERT.VOID);
      }
     
      
      testLogger.debug("Test forEachCell");
      
      var expecting = {
        r1: {f1: 1, f2: 1},
        r2: {f1: 1, f2: 2},
        r3: {f1: 1, f2: 1},
      };
      ASSERT.verifySuccess(matrix,"forEachCell",[function(el,row,col){
        if (expecting[row] && expecting[row][col]) {
          expecting[row][col]--;
        } else {
          testLogger.error("Unexpected cell during forEachCell "+ row+":"+col);
          ASSERT.fail();
        }
      }],ASSERT.VOID);
      for (var i in expecting) {
        for (var j in expecting[i]) {
          if(expecting[i][j] !== 0) {
            testLogger.error("Missed cell during forEachCell "+ i+":"+j);
            ASSERT.fail();
          }
        }
      }
    
      
      testLogger.debug("Test forEachCellInRow (simple case)");
      
      var r1 = {f1: 1, f2: 1};
      ASSERT.verifySuccess(matrix,"forEachCellInRow",["r1",function(el,row,col){
        ASSERT.verifyValue(row,"r1");
        if (r1[col]) {
          r1[col]--;
        } else {
          testLogger.error("Unexpected cell during forEachCellInRow (simple case) "+ row+":"+col);
          ASSERT.fail();
        }
      }],ASSERT.VOID);
      for (var f in r1) {
        if(r1[f] !== 0) {
          testLogger.error("Missed cell during forEachCellInRow (simple case) "+ f);
          ASSERT.fail();
        }
      }
      
      
      testLogger.debug("Test forEachCellInRow (row with a double on a position)");
      
      var r2 = {f1: 1, f2: 2};
      ASSERT.verifySuccess(matrix,"forEachCellInRow",["r2",function(el,row,col){
        ASSERT.verifyValue(row,"r2");
        if (r2[col]) {
          r2[col]--;
        } else {
          testLogger.error("Unexpected cell during forEachCellInRow (row with a double on a position) "+ row+":"+col);
          ASSERT.fail();
        }
      }],ASSERT.VOID);
      for (var f in r2) {
        if(r2[f] !== 0) {
          testLogger.error("Missed cell during forEachCellInRow (row with a double on a position) "+ f);
          ASSERT.fail();
        }
      }
      
      
      testLogger.debug("Test forEachCellInPosition (simple case)");
      
      //r2 f1
      var count = 1;
      ASSERT.verifySuccess(matrix,"forEachCellInPosition",["r2","f1",function(el,row,col){
        ASSERT.verifyValue(row,"r2");
        ASSERT.verifyValue(col,"f1");
        if (count) {
          count--;
        } else {
          testLogger.error("Unexpected cell during forEachCellInPosition (simple case) "+ row+":"+col);
          ASSERT.fail();
        }
      }],ASSERT.VOID);
      ASSERT.verifyValue(count,0,true);
     
      
      testLogger.debug("Test forEachCellInPosition (row with a double on the position)");

      count = 2;
      ASSERT.verifySuccess(matrix,"forEachCellInPosition",["r2","f2",function(el,row,col){
        ASSERT.verifyValue(row,"r2");
        ASSERT.verifyValue(col,"f2");
        if (count) {
          count--;
        } else {
          testLogger.error("Unexpected cell during forEachCellInPosition (row with a double on the position) "+ row+":"+col);
          ASSERT.fail();
        }
      }],ASSERT.VOID);
      ASSERT.verifyValue(count,0,true);
      
          
      testLogger.debug("TEST COMPLETE");
      
      this.end();
    }
  };
  
  Inheritance(CellMatrixTest,HtmlTest);
  return CellMatrixTest;
  
});