function monospew(element,opts){
  "use strict";

  if(typeof element == "string"){
    element = document.querySelector(element);
  }
  opts = opts || {};
  var retobj = {};
  var width = opts.width || 80;
  var height = opts.height || 24;

  function randomChar() {
    var chars = opts.chars ||
      ' !"#$%&\'()*+,-./0123456789:;<=>?' +
      '@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_' +
      '`abcdefghijklmnopqrstuvwxyz{|}~';
    return chars[Math.floor(Math.random()*chars.length)];
  }

  function randomString(num){
    var lineChars = [];
    for(var i = 0; i < num; i++) {
      lineChars[i]=randomChar();
    }
    return lineChars.join('');
  }

  function fitLines(content) {
    var lines = content.split('\n');

    //Fit to height
    var i;
    if(opts.append == 'top') {
      for(i = lines.length; i < height; i++)
        lines[i] = randomString(width);
      lines = lines.slice(0,height);
    } else {
      for(i = lines.length; i < height; i++)
        lines.unshift(randomString(width));
      lines = lines.slice(-height);
    }

    //Fit to width
    if(opts.append == 'right') {
      lines = lines.map(function(line){
        return randomString(Math.max(width-line.length,0)) +
          line.slice(-width);
      });
    } else {
      lines = lines.map(function(line){
        return line.slice(0,width) +
          randomString(Math.max(width-line.length,0));
      });
    }

    return lines.join('\n');
  }

  function append(base) {
    if(opts.append == 'replace') {
      return fitLines('');
    } else if(opts.append == 'left') {
      return base.replace(/^.*$/mg,function(line){return randomChar() + line});
    } else if(opts.append == 'right') {
      return base.replace(/^.*$/mg,function(line){return line + randomChar()});
    } else if(opts.append == 'top') {
      return randomString(width) + '\n' + base;
    } else {
      return base + '\n' +randomString(width);
    }
  }

  function instafill() {
    element.textContent = fitLines(element.textContent);
  }

  retobj.resize = function(w,h) {
    width = w || width; height = h || height;
    instafill();
  };

  retobj.listener = function() {
    var fillel = (opts.fill === undefined ||
      opts.fill === true) ? element : opts.fill;
      if(typeof fillel == "string"){
        fillel = document.querySelector(fillel);
      }
    if (fillel){
      var em;
      if(opts.em){
        em = opts.em;
      } else {
        var elcs = getComputedStyle(element);
        em = document.createElement("pre");
        em.style.fontFamily = elcs.fontFamily;
        em.style.fontSize = elcs.fontSize;
        em.style.fontStyle = elcs.fontStyle;
        em.style.fontVariant = elcs.fontVariant;
        em.style.fontWeight = elcs.fontWeight;
        em.style.position = "absolute";
        em.style.visibility = "hidden";
        em.style.width = "auto";
        em.style.height = "auto";
        em.textContent = 'm';
        //element must be in the document to get a clientWidth / Height
        document.body.appendChild(em);
      }
      var cw = em.clientWidth;
      var ch = em.clientHeight;
      if(!opts.em){
        document.body.removeChild(em);
      }
      var bw = fillel.clientWidth;
      var bh = fillel.clientHeight;
      retobj.resize(Math.floor(bw/cw) + (opts.extraHeight || 0),
        Math.floor(bh/ch) + (opts.extraWidth || 0));
    } else {
      //if not filling a particular element, still check if we should
      //fill the area we're set for
      instafill();
    }
  };

  retobj.timer = function() {
    element.textContent = fitLines(append(element.textContent));
  };

  //The interval / listener that has been configured for this function.
  //Saved in this closure for reliable cleanup purposes.
  var interval, listener;

  var cleanup = retobj.cleanup = function() {
    if(listener) {
      window.removeEventListener("resize",listener);
      listener = undefined;
    }
    if(interval) {
      clearInterval(interval);
      interval = undefined;
    }
  };

  var setup = retobj.setup = function() {
    cleanup();
    var delay = opts.delay === undefined ? 50 : opts.delay;

    if(delay) {
      interval = retobj.interval = setInterval(retobj.timer,delay);
    }

    if(opts.listen !== false) {
      listener = retobj.listener;
      window.addEventListener("resize",listener);
    }
    retobj.listener();
  };

  setup();
}