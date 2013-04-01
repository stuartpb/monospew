function monospew(element,opts){
  if(typeof element == "string"){
    element = document.querySelector(element);
  }
  opts = opts || {};
  var retobj = {};
  var width = opts.width || 80;
  var height = opts.height || 24;

  function cullExtraLines(content) {
    while((content.match(/\n/g)||[]).length >= height) {
      if(opts.append == 'top') {
        content = content.replace(/[^\n]*\n$/,'');
      } else {
        content = content.replace(/[^\n]*\n/,'');
      }
    }
    return content;
  }

  function randomString(num){
    var chars = opts.chars ||
      ' !"#$%&\'()*+,-./0123456789:;<=>?' +
      '@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_' +
      '`abcdefghijklmnopqrstuvwxyz{|}~';
    var lineChars = [];
    for(var i = 0; i < num; i++) {
      lineChars[i]=chars[Math.floor(Math.random()*chars.length)];
    }
    return lineChars.join('');
  }

  function randomLine() {
    return randomString(width) + '\n';
  }

  function addLine(base) {
    if(opts.append == 'top') {
      return randomLine() + base;
    } else {
      return base + randomLine();
    }
  }

  retobj.resize = function(w,h) {
    width = w || width; height = h || height;
    if(opts.instant !== false){
      var newContent = cullExtraLines(element.textContent);
      while((newContent.match(/\n/g)||[]).length < height) {
        newContent = addLine(newContent);
      }
      element.textContent = newContent;
    }
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
      retobj.resize(Math.floor(bw/cw) + (opts.bottomExtra || 0),
        Math.floor(bh/ch) + (opts.rightExtra || 0));
    }
  };

  retobj.timer = function() {
    element.textContent = addLine(
      cullExtraLines(element.textContent));
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