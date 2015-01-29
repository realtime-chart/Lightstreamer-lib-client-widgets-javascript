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
define(["Environment","IllegalArgumentException","Helpers","./LightstreamerConstants","Executor","BrowserDetection"], 
    function(Environment,IllegalArgumentException,Helpers,LightstreamerConstants,Executor,BrowserDetection) {

  Environment.browserDocumentOrDie();
  
  var ATTACH_TO_BORDER_WRONG = "The given value is not valid. Admitted values are no, left and right";
  var DISPLAY_TYPE_WRONG = "The given value is not valid. Admitted values are open, closed and dyna";
  
  //small arrow pointing to the right
  var RIGHT_ARROW = "<div style='position: absolute; left: 0px; top: 16px; width: 1px; height: 7px; background-color: #555555; box-shadow: 1px 1px 3px white, -1px 1px 3px white, 1px -1px 3px white, -1px -1px 3px white;' ></div>" +
  "<div style='position: absolute; left: 1px; top: 17px; width: 1px; height: 5px; background-color: #555555; box-shadow: 1px 1px 3px white, -1px 1px 3px white, 1px -1px 3px white, -1px -1px 3px white;' ></div>" +
  "<div style='position: absolute; left: 2px; top: 18px; width: 1px; height: 3px; background-color: #555555; box-shadow: 1px 1px 3px white, -1px 1px 3px white, 1px -1px 3px white, -1px -1px 3px white;' ></div>" +
  "<div style='position: absolute; left: 3px; top: 19px; width: 1px; height: 1px; background-color: #555555; box-shadow: 1px 1px 3px white, -1px 1px 3px white, 1px -1px 3px white, -1px -1px 3px white;' ></div>";

  //small arrow pointing to the left
  var LEFT_ARROW = "<div style='position: absolute; left: 0px; top: 19px; width: 1px; height: 1px; background-color: #555555; box-shadow: 1px 1px 3px white, -1px 1px 3px white, 1px -1px 3px white, -1px -1px 3px white;' ></div>" +
  "<div style='position: absolute; left: 1px; top: 18px; width: 1px; height: 3px; background-color: #555555; box-shadow: 1px 1px 3px white, -1px 1px 3px white, 1px -1px 3px white;' ></div>" +
  "<div style='position: absolute; left: 2px; top: 17px; width: 1px; height: 5px; background-color: #555555; box-shadow: 1px 1px 3px white, -1px 1px 3px white, 1px -1px 3px white;' ></div>" +
  "<div style='position: absolute; left: 3px; top: 16px; width: 1px; height: 7px; background-color: #555555; box-shadow: 1px 1px 3px white, -1px 1px 3px white, 1px -1px 3px white, -1px -1px 3px white;' ></div>";
  
  var widgetDisabled = BrowserDetection.isProbablyIE(6,true); 
  
  function generateLogoFallback() {
    var sImg = createDefaultElement("div");
    applyStyles(sImg,{
      textAlign: "center",
      textOverflow: "ellipsis",
      fontFamily: "Arial, Helvetica, sans-serif",
      fontSize: "10px",
      color: "#333333",
      verticalAlign: "middle",
      paddingTop: "3px",
      width: "32px",
      height: "32px",
      display: "none"
    });
    sImg.innerHTML = NETSTATE_LABEL;
    return sImg;
  }
  
  function generateImage(src) {
    var sImg = createDefaultElement("img");
    sImg.src = src;
    
    applyStyles(sImg,{
 //     width: "32px",
 //     height: "32px",
      display: "none"
    });
    
    return sImg;
  }
  
  //32x32 PGN "S" image - Base64 encoding - green version
  var GREEN_IMG = generateImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALDwAACw8BkvkDpQAAABl0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjUuN6eEncwAAAQDSURBVFhH7ZZtaJVlGMet1IpcgZHVF6XQCAJBxVkUEeGG7KzlS8xe9PiyM888vnBg7gyXExbOkmDH3M7mmmVDK9nOKJ2bw41UfJ3tKCgOF80PRUUvREQQZNvd7/9wP3US5vN4Zh8CBz/uc3au+3/9n+u5X64xY279/Z8r0Hn+zXGQDWGogRbohuNwFNqhCabftOdEbAK8BltgLzRbkozH4ApchSE4CE/dlOQITYZqWAUTXdGSd0smQR6UQR20RHatPrz+/chJPidhJ1TAQph8w2ZIlmXL+wvjLAkgNAPegjdgAUyDh+BReAZC0AAXYRiM5U/GJpjgywgJp8KXYCDOxBzotWIhifz0fVUWPAshSyljHbRA8+XByo8/ORk719xTumff0Q1P+EqsIBLeCZdtcrOlrfQz92miuyM9iEfhNPwOG+HedHG+T4IF0AQ/goFhuARvQ/Z1zZC40E2++1iFWdawzCljuLHIdJ2NSkiCotjrqYgZB/Ohy5r4gzGlio04l+RVroGK1mJTWFuIgbBZmSgw3Z+vd5MPInKbl4FrKnMfc8Z7ziH5q66B2L4ikx/PN8HEYrOiLs/s7FzuGvjUUyjTAJKPh/Mykegucwzkx+eZxe/kmlB9wFz8olwmzmSq72seyR+GlEys2xPEQMDk1TxnCuLPm5KmfHNhoHwIE4/5Ess0yO6GzQf6qn+NNC81gZocx4R4qXau2d6x5Pi2jkV3Z6rve55Ov/bU1opNyVXfvLB97t8mZOSVhrzv4l3RGDH3+BbMNFBro3p/JLhwR06/WwmNMrW5LfzDwdTWTelHdaZ5POd19K65q7Zz6YlFO/6phl7PGl6TXhcmKvX6PIVGE8ACfDzVXzZU3BhwFqYqoYWqBWu3cJ8W8mhyeM7FRN+5/jJTlAg4W1RbVVtWW9ea0Fb2Png8M40QgIEOHcm17UHnkAomXnYM6PByDzIdar70ERrrK9AGEX87fC0Dh3rXcky/6NwXOrY3thSnG6gaUZfJy+Ew/Ay6JFohF+7wMkPMOvdS6jwTvRpuDDkGdHHpAkurQOH1DIxFZB7o2vzKFWT8FuqhAB645kK5n/9VwW/W/Iq1763usn3CMFf3kbTkAze0Gw71ls/+6MiG5IFTsUsDVyqTJPgQNKrJULOhxkNVywZnm5G4yCY/y5hLQjWoqoCamWlelXR+V5tk2yW1TW4LpXbqAtTbJE8zPgIPwlSYD2rLtsFM6ZBwJqh9i8O/mhS/RqYgpgbydWiENjWYNJrdfG6FBMQgICOuqE4/UMOqxnWKr2ReQQg9Cert1WKr1R4E9fut8IFFrbla9CWQ5aXp+3fEpsMuUG+vRSV6bHKVtwTmwH93yPh2eytwFBX4C/nwkj6r2tmsAAAAAElFTkSuQmCC");
  //32x32 PGN "S" image - Base64 encoding - grey version
  var GREY_IMG = generateImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALDgAACw4BQL7hQQAAABp0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjUuMTAw9HKhAAAD00lEQVRYR+2WWWhUVxzG1bq0aBQsbi+KoiIIgpbGFsW3SmlB1AcfVEQxLi9CFjohZt/IIlRCJqNmAnGIEsjEENCEyczEKCpGM9rEYqlQ81BpCy2IlEJBTa6/73JOSYV4rxP7UHDgx5lkzvm+7557lv+0ae8//+cZGBgYmAWZcAy+hQ5IwA24BpchDBve2XMiNg/2QRVcgIihk/Y6jMILGIMr8Pk7MUdoOVTDUVhoRaurqxfDV/ANBKGjpqYmXldXd4vvnXAWTsJuWP7WYTDLMNP7jPYTCSC0EWqhAnbBGlgKq2ArZMEZ+B7GwTG8pA3DPF9BMFwNP4EDpxn4BdwxYlkSGR0dzYBtkGXIow1CB0SGh4fbe3p67kej0bbu7u71vozVCcM58KMxd5qbm6/ap6mvr08ing234W8ogPkTxfl7MeyCMPwBDozDQzgFmW8Mg/Eea97V1eWUlpa601hZWenE43EJSVAc8Xoq+syCnRAzIZ7T3tOMTToW83IbIBgMOgUFBW6A4uJiJ5FIWPPHiEz3CvDazCxgzGzPMZjvtQEaGhqcvLw817yoqMhpa2uzAbo9hdLtgPls+E4h2tvb3QC5ublOfn6+U1JS4qRSKYUYTFff1zjMl8E9hWDhuSGys7PdIBUVFc7Q0NAYIdb6Eku3k9kNJclk8s/a2lonJyfHDSE0G62trTdaWlo+Slff9zidfv39/Sebmpp+sTNhgxQWFv7GugjQZ65vwXQ7am2Ew+EDgUDgBxtArUKFQqHfCVk08ahO18dzXCwW+zASidwkyD+vRK+HO8DR6yJEsV6fp9BUOrAA1w0ODo6VlZW5C9POhBas2cIpLeSpeHiOJUSKEO4ZoUWpIHod2romhLay98Hj6TRJBwL06EhmN7iHlIIogA4ve5DpUPOlj9BMXx1NJ/rPgCcK0NfX55rruNax3djYODFA+aS6DD4IcXgKuiSisB0+8ApDnxP2UmJRvqiqqnID6OLSBTZhBva8KcBMRL4EXZs/W0HaXyEEO2DRaxfKx/yvHP4y4Q9xSMVMnTDO1Y23W0OIR2+1G7hqPyV9Z29v78ORkZFODC6CWhUZKjZUeGjWMsHdZhgfNuZ3abdjqAJV5ipm1njNpPu7yiRTLqlssiWUyqkHEDImW2hXwhJYDTtBZVkdbJIOhptA5dtp+FeR4jfICsRUQBbCObikApNCM8H3KDRBAL5WECuK2UJQwarCdYUvM69OCH0Gqu1VYqvUfgyq96Nw3qDSXCX6fsjw0vT9O2IboAVU29tP0phreo/DZvjvDhnfad93nMIMvAIArtySMI7UCwAAAABJRU5ErkJggg==");
  //32x32 PGN "S" image - Base64 encoding - light green version
  var LIGHT_GREEN_IMG = generateImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALDgAACw4BQL7hQQAAABp0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjUuMTAw9HKhAAAECElEQVRYR+2WX2hbZRjGp9uq4qqguOnNhrKJIAycWJWJdw5RkM2LXaiIYnXeCMLYwLkJFQeK4G5mVOqFQ0VoK+iyxJg2bZrEpK3LRpqky9iyLq3705b9UcSBs/38PWffGWfV5JxOxxC8+PGlzTnv++T9vvf9nnmhUGje1eSqJtcP/28LqE3tWwgtsAE+gA7ohjQkIQztsLLeNs+5AgRbBM/CO/AF7LJ0sfbDETgP07AHHm50xgILINBS2A6vwC1u0P6R/sXwBGyCndCRGknFMwdSP/C5Cz6GLfA0LJ0txlcAyZptec+y3q8ABLoP3oW3YR2sgNvhLngEWuEjKMIMGMsfrO2wyBXSUAAJl8NhMLCDFx+DQRusVUHO/fZjMzwKrZaNrDuhA3ad+XnoqyMncvsqP2U/P3Qse2/gCpDwOqjY5CZfzfa6vyZTSfUQ/HXIwTl4A27yBufvxbAO2mEKDMxAGd6HloZtSOL1bvLK8QGTKCUulLHcZ8YmMgqkgOJlv0HGMwthLcSsiN9Z86pY3S0geZsrYKCaNPFi3BHQV4qa8cmMm7xKkGv8BMyqzM280+R7Bkj+jCsgd6jPRAtRqhA3vcWIKdd6XQHfzCX53z3bqAJNCNgvEaXxrCMgWthj4sNhqhAxp87mJGLgiglQYJLfAXmJSB9MICBiIoVvWXezHVFz6kxuGhF3/xMRQeaAuuGt0cn8L6lKAgFhR4T4vrjbFGo96f212A2XK8JXgBtY0+/oVH7LYDV5TBVwRWjtLkVOFMYym3nmxrkKCSzAI6QpP5p6PjYcHvGKkKihav8kIrd6R7WfoDkLuChkInV9sZbIxIa91QgbbZO2CxHbNMyumAA7hu+ZOp2dTpYjzsG8cEAjzoG1LbxXB/lfuQ3rBaEL9iLCaU21qFpVLavWtSLUyhcHT+C7wK907vcIiGgkF48mnCGVKHU7AjS83EGmoVYv3iVngEALgia2W3At74xLQG0iTRW+c8a1xvbA4aRXQFtdAbz8AsThNOiS6IQ1MN9PDM+85l5KtZOZ87qoJEAXly4wTwXWNxKwgCCPg67NMc8td5zPIXgKbpt1odzK/9rgVyv+xfSBVMz6hBmu7j5P8oONuuEvbVibyD2AcegaPZkrYya6SPAlaJXJkNmQ8VDVWsBpMxK/ZJMPsa4hoQyqKiAzsyJQF8gmWbsk2+RaKNmpYQjZJKtZ74QlsBzWgmzZe7DK3h+rSCr7tgMuMSmBbkMCLQMZyDfhE/haBhOj2c3nTvgQNsOTEuId1SSUYZVxXeZ3ftzv/TzhQwSTt5fFltWugvx+J3xmkTWXRX8OmoMm9hVAsJXwKcjb61CJHptc5X0VHoS6QyaImMu+C4IED/LM/wL+BDxNDVItZyFPAAAAAElFTkSuQmCC");
  
  var imgFallback = false;
  
  var INDICATOR_LABEL = "REAL-TIME<br/>SERVER";
  var NETSTATE_LABEL = "Net<br/>State";
  
  var BLINK_TIME = 500;
  
  var LEFT_CLOSED = "-225px";
  var LEFT_OPEN = "0px";
  var RIGHT_CLOSED = "-225px";
  var RIGHT_OPEN = "0px";
  
  var NO = "no";
  var LEFT = "left";
  var RIGHT = "right";
  var ATTACH_TO_MAP = makeMap(NO,LEFT,RIGHT);
  
  var DYNA = "dyna";
  var OPEN = "open";
  var CLOSED = "closed";
  var DISPLAY_TYPES = makeMap(DYNA,OPEN,CLOSED);
  
  function makeMap() {
    var res = {};
    for (var i=0; i<arguments.length; i++) {
      res[arguments[i]] = true;
    }
    return res;
  }
  
  function applyStyles(element,styles) {
    for (var i in styles) {
      element.style[i] = styles[i];
    }
  }
  
  function createDefaultElement(tagName) {
    var el = document.createElement(tagName);
    applyStyles(el,{
      backgroundColor: "transparent"
    });
    return el;
  }
  
  function appendSons(element,sonList) {
    for (var i = 0; i<sonList.length; i++) {
      element.appendChild(sonList[i]);
    }
  }
  
  function checkCSSAnimation() {
    var toCheck = ["animationName", "WebkitAnimationName", "MozAnimationName", "OAnimationName", "msAnimationName"]; 
    var testEl = document.createElement("div");
    var testElStyle = testEl.style;
    
    for ( var i = 0; i < toCheck.length; i++ ) {
      if(typeof testElStyle[toCheck[i]] != "undefined") {
        return true;
      }
    }
    return false;
  }
  var TRANSITION_SUPPORTED = checkCSSAnimation();
  
  /**
   * Creates an object to be used to listen to events from a 
   * {@link LightstreamerClient} instance.
   * The new object will create a small visual widget to display the status of
   * the connection.
   * The created widget will have a fixed position so that it will not move
   * when the page is scrolled. 
   * @constructor
   * 
   * @param {String} attachToBorder "left" "right" or "no" to specify if the generated
   * widget should be attached to the left border, right border or should not be 
   * attached to any border. In the latter case, it should be immediately positioned
   * manually, by acting on the DOM element obtained through {@link #getDomNode}.
   * @param {String} distance The distance of the widget from the top/bottom (depending
   * on the fromTop parameter). The specified distance must also contain the units
   * to be used: all and only the units supported by CSS are accepted. 
   * @param {boolean} fromTop true or false to specify if the distance is related
   * to the top or to the bottom of the page.
   * @param {String} initialDisplay "open" "closed" or "dyna" to specify if the generated
   * widget should be initialized open, closed or, in the "dyna" case, open and then 
   * immediately closed. By default "dyna" is used. 
   * If attachToBorder is set to "no" then this setting has no effects. 
   * 
   * @throws {IllegalArgumentException} if an invalid value was passed as 
   * attachToBorder parameter.
   * 
   * @exports StatusWidget
   * @class This class is a simple implementation of the {@link ClientListener}
   * interface that will display a small widget containing informations about 
   * the status of the connection.
   * <BR>Note that the widget is generated using some features not available 
   * on old browsers but as long as the 
   * <a href="http://tools.ietf.org/html/rfc2397">"data" URL scheme</a>  is supported 
   * the minimal functions of the widget will work (for instance, IE<=7 does not have support 
   * for the "data" URL scheme).
   * <BR>Also note that on IE if "Quirks Mode" is activated the widget will not 
   * be displayed correctly. Specify a doctype on the document where the widget
   * is going to be shown to prevent IE from entering the "Quirks Mode".
   * 
   * @extends ClientListener
   */
  var StatusWidget = function(attachToBorder, distance, fromTop, initialDisplay) {
    if (widgetDisabled) {
      return;
    }
    
    this.toggleState = "closed";

    this.openByHover = arguments[4] !== false;
    
    this.widgetNode = null;
    this.widgetTextNode = null;
    this.widgetImageNode = null;
    this.widgetArrowNode = null;

    attachToBorder = attachToBorder || LEFT;
    if (!ATTACH_TO_MAP[attachToBorder]) {
      throw new IllegalArgumentException(ATTACH_TO_BORDER_WRONG);
    }

    this.isLeftBorder = attachToBorder === LEFT;

    var topClosed = fromTop ? distance : "auto";
    var bottomClosed = fromTop ?  "auto" : distance;
        
///////////////////////HTML generation    

    this.statusWidgetContainer = createDefaultElement("div");
    
    //container
    this.widgetNode = createDefaultElement("div");
    applyStyles(this.widgetNode, {
      width: "270px",
      height: "40px",
      backgroundColor: "#dddddd",
      opacity: "0.85",
      filter: "alpha(opacity"+"=85)",
      "boxShadow": "#999 1px 3px 7px"
    });
    
    if (attachToBorder == "no") {
      this.noToggle = true;
      applyStyles(this.widgetNode,{
        position: "absolute",
        "borderRadius": "8px"
      });
      
    } else {
      
      applyStyles(this.widgetNode,{
        position: "fixed",
        top: topClosed,
        bottom: bottomClosed,
        zIndex: "99999",
        
        "transition-duration": "1s",
        "MozTransitionDuration": "1s", 
        "-webkit-transition-duration": "1s",
        "OTransitionDuration": "1s",
        "-ms-transition-duration": "1s",
        
        "transition-timing-function": "ease",
        "MozTransitionTimingFunction": "ease",
        "-webkit-transition-timing-function": "ease",
        "OTransitionTimingFunction": "ease",
        "-ms-transition-timing-function": "ease",
        
        "transition-property": attachToBorder,
        "MozTransitionProperty": attachToBorder,
        "-webkit-transition-property": attachToBorder,
        "OTransitionProperty": attachToBorder,
        "-ms-transition-property": attachToBorder
      });
      

      if (attachToBorder == LEFT) {
        applyStyles(this.widgetNode,{
          left: LEFT_CLOSED,
          "borderTopRightRadius": "8px",
          "borderBottomRightRadius": "8px"
        });
        
      } else {
        //if (attachToBorder == RIGHT)
        applyStyles(this.widgetNode,{
          right: RIGHT_CLOSED,
          "borderTopLeftRadius": "8px",
          "borderBottomLeftRadius": "8px"
        });

      }
    }
    
    //firstTd
    var firstTd = createDefaultElement("td");
    applyStyles(firstTd, {
      width: "70px",
      height: "40px",
      textAlign: "center",
      textOverflow: "ellipsis",
      fontFamily: "Arial, Helvetica, sans-serif",
      fontSize: "10px",
      color: "#333333",
      fontWeight: "bolder",
      textShadow: "white 1px 1px 1px",
      verticalAlign: "middle",
      padding:"0",
      lineHeight: "13px"
    });
    firstTd.innerHTML = INDICATOR_LABEL;
    
    //secondTd
    this.widgetTextNode = createDefaultElement("td");
    applyStyles(this.widgetTextNode,{
      width: "150px",
      height: "40px",
      textAlign: "center",
      textOverflow: "ellipsis",
      fontFamily: "Arial, Helvetica, sans-serif",
      fontSize: "10px",
      color: "#333333",
      textShadow: "1px 1px 1px white",
      verticalAlign: "middle",
      padding:"0",
      lineHeight: "13px"
    });
    
    ////////table
    var table = createDefaultElement("table");
    
    applyStyles(table,{
      position: "absolute",
      left: (attachToBorder == LEFT || attachToBorder == NO ? "0px" : "50px"),
      borderSpacing: 0,
      border: 0,
      tableLayout: "fixed",
      width: "220px"
    });
      
    var singleTr = createDefaultElement("tr");
    if (attachToBorder == RIGHT) {
      appendSons(singleTr,[this.widgetTextNode,firstTd]);
    } else {
      appendSons(singleTr,[firstTd,this.widgetTextNode]);
    }
    
    //if we omit the tbody tag IE7 will not show the status
    //(in any case will not show the icon as it does not support the data URIs)
    var tbody = createDefaultElement("tbody");
    tbody.appendChild(singleTr);
    table.appendChild(tbody);

    ////////firstSeparator
    var firstSeparator = createDefaultElement("div");
    applyStyles(firstSeparator,{
      position: "absolute",
      top: "4px",
      width: "1px",
      height: "32px",
      backgroundColor: "#555555",
      "boxShadow": "1px 1px 3px white, -1px 1px 3px white, 1px -1px 3px white, -1px -1px 3px white"
    });    
    
    ////////secondSeparator
    var secondSeparator = createDefaultElement("div");
    applyStyles(secondSeparator,{
      position: "absolute",
      height: "32px",
      top: "4px",
      width: "1px",
      backgroundColor: "#555555",
      "boxShadow": "1px 1px 3px white, -1px 1px 3px white, 1px -1px 3px white, -1px -1px 3px white"
    });
    
    ////////arrowContainer
    this.widgetArrowNode = createDefaultElement("div");
    applyStyles(this.widgetArrowNode,{
      position: "absolute",
      top: "0px",
      width: "4px",
      height: "40px"
    });
    
    ////////imageContainer
    var imageContainer  = createDefaultElement("div");
    applyStyles(imageContainer,{
      position: "absolute",
      top: "0px",
      width: "35px",
      height: "35px",
      paddingTop: "5px"
    });
    
    if (attachToBorder == NO) {
      imageContainer.style.left = "233px";
      firstSeparator.style.left = "70px";
      secondSeparator.style.left = "220px";
      appendSons(this.widgetNode,[table,firstSeparator,secondSeparator,imageContainer]);
    } else {
      
      if (attachToBorder == LEFT) {
        firstSeparator.style.left = "70px";
        secondSeparator.style.left = "220px";
        this.widgetArrowNode.style.left = "228px";
        imageContainer.style.left = "233px";
        
        this.widgetArrowNode.innerHTML = RIGHT_ARROW;
        
        appendSons(this.widgetNode,[table,firstSeparator,secondSeparator,this.widgetArrowNode,imageContainer]);
        
      } else {
        //if (attachToBorder == RIGHT) 
      
        firstSeparator.style.right = "70px";
        secondSeparator.style.right = "220px";
        this.widgetArrowNode.style.right = "228px";
        imageContainer.style.right = "233px";
        
        this.widgetArrowNode.innerHTML = LEFT_ARROW;
        
        appendSons(this.widgetNode,[firstSeparator,secondSeparator,this.widgetArrowNode,imageContainer,table]);
        
      }
      
      Helpers.addEvent(this.statusWidgetContainer,"mouseover",this.getMouseoverHandler());
      Helpers.addEvent(this.statusWidgetContainer,"click",this.getClickHandler());
      var trHandler = this.getTransitionendHandler();
      Helpers.addEvent(this.statusWidgetContainer,"transitionend",trHandler);
      Helpers.addEvent(this.statusWidgetContainer,"webkitTransitionEnd",trHandler);
      Helpers.addEvent(this.statusWidgetContainer,"MSTransitionEnd",trHandler);
      Helpers.addEvent(this.statusWidgetContainer,"oTransitionEnd",trHandler);
    }
    
    this.widgetTextNode.innerHTML = "Ready";
    
    this.statusWidgetContainer.appendChild(this.widgetNode);
    
    this.ready = false;
    this.readyStatusOpen = false;
    this.cachedStatus = null;
    
    this.activate();
    
    this.lsClient = null;
    this.blinkThread = null;
    this.blinkFlag = false;
    
    initialDisplay = initialDisplay || DYNA;
    if (!DISPLAY_TYPES[initialDisplay]) {
      throw new IllegalArgumentException(DISPLAY_TYPE_WRONG);
    }
    
    if (initialDisplay != CLOSED) {
      this.toggleExe(true);
      if (initialDisplay == DYNA) {
        Executor.addTimedTask(this.toggleExe,1000,this);
      }
    }
    
    this.initImages(imageContainer);
  };
  

    
  StatusWidget.prototype = {
      
      /**
       * Inquiry method that gets the DOM element that makes the widget container.
       * It may be necessary to extract it to specify some extra styles or to position
       * it in case "no" was specified as the attachToBorder constructor parameter.
       *
       * @return {DOMElement} The widget DOM element.
       */
      getDomNode: function() {
        return this.widgetNode;
      },
      
      /**
       * @private
       */
      initImages: function(imageContainer) {
        
        this.greyImg = GREY_IMG.cloneNode(true);
        imageContainer.appendChild(this.greyImg);
        
        this.updateWidget(this.greyImg);
        
        if (!imgFallback && this.greyImg.height != 32 && BrowserDetection.isProbablyIE(7)) { 
          imageContainer.removeChild(this.greyImg);
          
          //fallback!
          GREY_IMG = GREEN_IMG = LIGHT_GREEN_IMG = generateLogoFallback(); 
          imgFallback = true;
          
          this.greyImg = GREY_IMG.cloneNode(true);
          imageContainer.appendChild(this.greyImg);
          
          this.updateWidget(this.greyImg);
        }
        
        this.greenImg = GREEN_IMG.cloneNode(true);
        imageContainer.appendChild(this.greenImg);
        
        this.lgreenImg = LIGHT_GREEN_IMG.cloneNode(true);
        imageContainer.appendChild(this.lgreenImg);
        
      },
      
      /**
       * @ignore
       */
      toggle:function() {
        if (this.noToggle || widgetDisabled) {
          return;
        }

        if(!this.ready) {
          this.readyStatusOpen = !this.readyStatusOpen;
        } else {
          Executor.addTimedTask(this.toggleExe,0,this);
        }

      },
      
      /**
       * @private
       */
      activate: function() {
        if (this.ready) {
          return;
        }
        
        var body = document.getElementsByTagName("body");
        if (!body || body.length == 0) {
          //no body means we can't append; if there is no body DOMContentLoaded cannot have already being fired, so let's wait for it 
          var that = this;
          //this widget uses styles not available on older browsers so that we do not need to setup a fallback to help browsers not having the DOMContentLoadEvent
          Helpers.addEvent(document,"DOMContentLoaded",function() {
            document.getElementsByTagName("body")[0].appendChild(that.statusWidgetContainer);
            that.ready = true;
            if (that.cachedStatus) {
              that.onStatusChange(that.cachedStatus);
            }
            if (that.readyStatusOpen) {
              that.toggle();
            }
          });
          
        } else {
          body[0].appendChild(this.statusWidgetContainer);
          this.ready = true;
        }
      },
      
      /**
       * @inheritdoc
       */
      onListenStart: function(lsClient) {
        if(widgetDisabled) {
          return;
        }
        this.onStatusChange(lsClient.getStatus());
        this.lsClient = lsClient;
      },

      /**
       * @inheritdoc
       */
      onListenEnd: function() {
        if(widgetDisabled) {
          return;
        }
        //Ready
        // When listener not attached to LightstreamerClient
        // S is grey
        this.updateWidget(this.greyImg,"Ready");
        this.lsClient = null;
      },

      /**
       * @private
       */
      updateWidget: function(img,text) {
        //GREY_IMG GREEN_IMG LIGHT_GREEN_IMG
        if (text) {
          this.stopBlinking();
          this.widgetTextNode.innerHTML = text;
        }
        
        if (this.widgetImageNode) {
          this.widgetImageNode.style.display = "none";
        }
        img.style.display = "";
        this.widgetImageNode = img;
        
      },
      
      /**
       * @private
       */
      stopBlinking: function() {
        if (!this.blinkThread) {
          return;
        }
        this.blinkFlag = false;
        Executor.stopRepetitiveTask(this.blinkThread);
        this.blinkThread = null;
      },
      
      /**
       * @private
       */
      startBlinking: function() {
        this.blinkThread = Executor.addRepetitiveTask(this.doBlinking,BLINK_TIME,this);
      },
      
      /**
       * @private
       */
      doBlinking: function() {
        this.updateWidget(this.blinkFlag?this.greyImg:this.greenImg);
        this.blinkFlag = !this.blinkFlag;
      },
      
      /**
       * @inheritdoc
       */
      onStatusChange: function(status) {
        if (!this.ready || widgetDisabled) {
          this.cachedStatus = status;
          return;
        }
        
        if (status == LightstreamerConstants.DISCONNECTED) {
          //Disconnected
          // When status is DISCONNECTED
          // S is grey
          this.updateWidget(this.greyImg,"Disconnected");
          
        } else if (status == LightstreamerConstants.CONNECTING) {
          //Connecting...
          // When status is CONNECTING
          // S is blinking green (switching between green and grey)
          this.updateWidget(this.greyImg,"Connecting...");
          this.startBlinking();
        } else if  (status == LightstreamerConstants.CONNECTED+LightstreamerConstants.SENSE) {
          //Connected
          //stream-sensing...
          // When status is CONNECTED:STREAM-SENSING
          // S is blinking green (switching between green and grey)
          this.updateWidget(this.greyImg,"Connected<br/>Stream-sensing...");
          this.startBlinking();
        } else if (status.indexOf(LightstreamerConstants.CONNECTED) == 0) {
          //Connected over [WebSocket|HTTP]
          //in [Streaming|Polling] mode [(slave)]
          // When status is CONNECTED:!(STREAM-SENSING)
          // S is green
          var isSecure = this.lsClient && this.lsClient.connectionDetails.getServerAddress().indexOf("https") == 0;
          var txt = "Connected over " + (status.indexOf("HTTP") > -1 ? (isSecure ? "HTTPS" : "HTTP") : (isSecure ? "WSS" : "WebSocket")) + "<br/>in " + (status.indexOf("STREAMING") > -1 ? "Streaming" : "Polling") + " mode" + (!this.lsClient || this.lsClient.connectionSharing.isMaster() ? "" : (" "+"(slave)"));
          this.updateWidget(this.greenImg,txt);
        } else if (status == LightstreamerConstants.STALLED) {
          //Stalled
          // When status is STALLED
          // S is ligh green
          this.updateWidget(this.lgreenImg,"Stalled");
        } else {
          //Disconnected
          //will retry
          // When status is DISCONNECTED:WILL-RETRY
          // S is grey
          this.updateWidget(this.greyImg,"Disconnected<br/>(will retry)");
        }

      },
      
      
      /**
       * @private
       */
      toggleExe: function(force) {
        if (this.toggleState == "closed") {
          if (this.isLeftBorder) {
            this.widgetNode.style.left = LEFT_OPEN;
            if (!TRANSITION_SUPPORTED || force) {
              this.transitionendHandler();
            }

          } else {
            this.widgetNode.style.right = RIGHT_OPEN;
            if (!TRANSITION_SUPPORTED || force) {
              this.transitionendHandler();
            }
          }

        } else if (this.toggleState == "open") {

          if (this.isLeftBorder) {
            this.widgetNode.style.left = LEFT_CLOSED;
            if (!TRANSITION_SUPPORTED || force) {
              this.transitionendHandler();

            }     

          } else  {
            this.widgetNode.style.right = RIGHT_CLOSED;
            if (!TRANSITION_SUPPORTED || force) {
              this.transitionendHandler();
            }   
          } 

        }

      },

      /**
       * @private
       */
      getMouseoverHandler: function() {
        var that = this;
        return function() {
          that.mouseoverHandler();
        };
      },
      
      /**
       * @private
       */
      mouseoverHandler: function() {
        if (this.openByHover) {
          if (this.toggleState == "closed") {
            this.toggleExe();
          }
        }
      },

      /**
       * @private
       */
      getClickHandler: function() {
        var that = this;
        return function() {
          that.clickHandler();
        };
      },

      /**
       * @private
       */
      clickHandler: function() {
        this.toggleExe();
      },

      /**
       * @private
       */
      getTransitionendHandler: function() {
        var that = this;
        return function() {
          that.transitionendHandler();
        };
      },

      /**
       * @private
       */
      transitionendHandler: function() {
        if (this.isLeftBorder) {
          if (this.widgetNode.style.left == LEFT_OPEN) {
            this.widgetArrowNode.innerHTML = LEFT_ARROW;
            this.toggleState = "open";
          } else {
            this.widgetArrowNode.innerHTML = RIGHT_ARROW;
            this.toggleState = "closed";      
          }

        } else {
          if (this.widgetNode.style.right == RIGHT_OPEN) {
            this.widgetArrowNode.innerHTML = RIGHT_ARROW;
            this.toggleState = "open";
          } else {
            this.widgetArrowNode.innerHTML = LEFT_ARROW;
            this.toggleState = "closed";      
          }
        }
      }
  };
  
  //closure compiler eports
  StatusWidget.prototype["onStatusChange"] = StatusWidget.prototype.onStatusChange;
  StatusWidget.prototype["onListenStart"] = StatusWidget.prototype.onListenStart;
  StatusWidget.prototype["onListenEnd"] = StatusWidget.prototype.onListenEnd;
  StatusWidget.prototype["getDomNode"] = StatusWidget.prototype.getDomNode;

  return StatusWidget;
  
});