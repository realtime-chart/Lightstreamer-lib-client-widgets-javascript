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
define([weswitClassPrefix+"Cell","./HtmlTest","weswit/Inheritance","weswit/ASSERT","weswit/BrowserDetection"],
    function(Cell,HtmlTest,Inheritance,ASSERT,BrowserDetection) {
   
  var testLogger = HtmlTest.testLogger;
  
  var CellTest = function(wData) {
    this._callSuperConstructor(CellTest);
    
    this.prefix = wData ? "data-" : "";
  };
  
  CellTest.getInstances = function() {
    return [new CellTest(true),new CellTest(false)];
  };
  
  CellTest.prototype = {
    toString: function() {
      return "[CellTest]";
    },
    
    start:function() {
      this._callSuperMethod(CellTest,"start");
      this.write('<div id="c1" '+this.prefix+'source="Lightstreamer">c1</div>');
      this.write('<input id="c2" '+this.prefix+'source="Lightstreamer" type="text" value="c2"></input>');
      this.write('<img id="c3" '+this.prefix+'source="Lightstreamer" src="c3" '+this.prefix+'update="src"/>');
      this.write('<div id="c4" '+this.prefix+'source="Lightstreamer" style="background-color:red">c4</div>');
      this.write('<div id="c5" '+this.prefix+'source="Lightstreamer">c5</div>');
      this.write('<div id="c6" '+this.prefix+'source="Lightstreamer" '+this.prefix+'update="custom" custom="c6">Div</div>');
      
      this.write('<div id="c7" '+this.prefix+'source="something-else">Div</div>');
      

      if (!Cell.getLSTags) {
        //currently can't work on the minified version
        this.end();
        return;
      }
      Cell.useOldNames = null;
      
      var cells = null;
      ASSERT.verifySuccess(Cell,"getLSTags",[document,["div","input","img"]],true,function(v1,v2) {
        cells = v1;
        return ASSERT.verifyValue(v1.length,6);
      });
      
      testLogger.debug("Verify c4 attached to dom");
      ASSERT.verifySuccess(Cell,"isAttachedToDOM",[document.getElementById("c4")],true);
      
      var waiting = {c1:true, c2:true, c3:true, c4:true, c5:true, c6:true};
      for (var i = 0; i<cells.length; i++) {

        ASSERT.verifySuccess(cells[i],"updateCSSClass",["updated"],ASSERT.VOID);
        ASSERT.verifySuccess(cells[i],"setAttributes",[{fontWeight:"bold",borderColor:"green"}],ASSERT.VOID);
                
        testLogger.debug("Verify cell "+cells[i]+" attached to dom");
        ASSERT.verifySuccess(cells[i],"isAttachedToDOM",ASSERT.VOID,true);
        ASSERT.verifySuccess(cells[i],"isAttachedToDOMById",ASSERT.VOID,true);
        
        var val = null;
        testLogger.debug("Verify cell "+cells[i]+" value");
        ASSERT.verifySuccess(cells[i],"retrieveValue",ASSERT.VOID,true,function(v1,v2) {
          if (v1 in waiting) {
            val = v1;
            delete(waiting[v1]);
            return true;
          } else {
            return ASSERT.fail();
          }
        });
        
        testLogger.debug("Verify cell "+cells[i]+" update value");
        ASSERT.verifySuccess(cells[i],"updateValue",["/u"+val],ASSERT.VOID);
        
        var expect = "/u"+val;
        if (cells[i].getTagName().toLowerCase() == "img" && BrowserDetection.isProbablyIE()) {
          //document.location.protocol+"//"+document.location.hostname+"/U"+i;
        } 
        
        ASSERT.verifySuccess(cells[i],"retrieveValue",ASSERT.VOID,expect);
        
     
      }
      /*
      var imgCell = new Cell(document.getElementById("c3"));
      imgCell.updateValue("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAIAQMAAADDU02uAAAAAXNSR0IArs4c6QAAAAZQTFRFwMDAAJkzNITx4wAAAAF0Uk5TAEDm2GYAAAABYktHRACIBR1IAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH2wIICTEdodNtJwAAAClJREFUCNdjYHBgYGB4wMDA+IGBgfkHAwP7HwYG/n8MDPL/GRjs/zcAAGeQB/lVrh+pAAAAAElFTkSuQmCC");
      */
      
      //remove c1
      var removeIt = document.getElementById("c1");
      var removeItCell = new Cell(removeIt);
      removeIt.parentNode.removeChild(removeIt);
      
      testLogger.debug("Verify removed cell");
      ASSERT.verifySuccess(removeItCell,"isAttachedToDOM",ASSERT.VOID,false);
      ASSERT.verifySuccess(removeItCell,"isAttachedToDOMById",ASSERT.VOID,false);
      
      //scroll c4 to c5
      var fromCell = new Cell(document.getElementById("c4"));
      var toCell = new Cell(document.getElementById("c5"));
      var fakeCell = new Cell(document.createElement("span"));
      
      ASSERT.verifySuccess(fakeCell,"scrollHere",[toCell],ASSERT.VOID);
      ASSERT.verifySuccess(toCell,"scrollHere",[fromCell],ASSERT.VOID);
      ASSERT.verifySuccess(fromCell,"scrollHere",[fakeCell],ASSERT.VOID);

      testLogger.debug("Verify cell-scrolling");
      testLogger.debug("to value");
      ASSERT.verifySuccess(toCell,"retrieveValue",ASSERT.VOID,"/uc4");
      testLogger.debug("from value");
      ASSERT.verifySuccess(fromCell,"retrieveValue",ASSERT.VOID, "/uc5");
      testLogger.debug("to BG");
      ASSERT.verifyValue(toCell.el.style.backgroundColor,"red");
      testLogger.debug("from BG");
      ASSERT.verifyValue(fromCell.el.style.backgroundColor,"");
      
      ASSERT.verifySuccess(fromCell,"clean",ASSERT.VOID,ASSERT.VOID);
      testLogger.debug("Verify after clean");
      ASSERT.verifySuccess(fromCell,"retrieveValue",ASSERT.VOID, "/uc4"); //cell created when val was already uc4
      ASSERT.verifyValue(fromCell.el.style.backgroundColor,"red");
          
      testLogger.debug("TEST COMPLETE");
      
      //reset this
      Cell.useOldNames = null;
      this.end();
    }
  };
  
  Inheritance(CellTest,HtmlTest);
  return CellTest;
  
});