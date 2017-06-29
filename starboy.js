/*
 * @Author: PengJiyuan
 * @Aha? I'm a StarBoy
 * @Sweet Heart
 */

;(function() {
  var canvas = document.getElementById('magic');
  var ctx = canvas.getContext('2d');
  var moveCount = 80;
  var width = 800;
  var height = 120;
  var holderCount = 1600;
  var stars = [];
  var holdersPos = [];
  var timer = null;
  var hasSpeed = false;
  var lyric;
  canvas.width = width;
  canvas.height = height;

  // var xmlhttp = new XMLHttpRequest();
  // xmlhttp.onreadystatechange=function()
  // {
  //   if (xmlhttp.readyState==4 && xmlhttp.status==200)
  //   {
  //     lyric = parseLyric(xmlhttp.responseText);
  //     console.log(lyric);
  //   }
  // }
  // xmlhttp.open("GET","./mp3/bgm.lrc",true);
  // xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  // xmlhttp.send();

  // // lyrics parse
  // function parseLyric(lrc) {
  //   var lyrics = lrc.split("\n");
  //   var lrcObj = {};
  //   for(var i=0;i<lyrics.length;i++){
  //       var lyric = decodeURIComponent(lyrics[i]);
  //       var timeReg = /\[\d*:\d*((\.|\:)\d*)*\]/g;
  //       var timeRegExpArr = lyric.match(timeReg);
  //       if(!timeRegExpArr)continue;
  //       var clause = lyric.replace(timeReg,'');
  //       for(var k = 0,h = timeRegExpArr.length;k < h;k++) {
  //           var t = timeRegExpArr[k];
  //           var min = Number(String(t.match(/\[\d*/i)).slice(1)),
  //               sec = Number(String(t.match(/\:\d*/i)).slice(1));
  //           var time = min * 60 + sec;
  //           lrcObj[time] = clause;
  //       }
  //   }
  //   return lrcObj;
  // }

  function Magic(texts) {
    this.canvasholder = document.getElementById('holder');
    this.ctxholder = this.canvasholder.getContext('2d');
    this.width = width;
    this.height = height;
    this.textSize = 50;
    this.canvasholder.width = this.width;
    this.canvasholder.height = this.height;
    this.texts = texts;
    this.allstars = [];

    this.getTextData(this.texts);
  }

  Magic.prototype = {

    getTextData: function(text) {
      var _this = this;
      this.texts.forEach(function(item, i) {
        _this.ctxholder.clearRect(0, 0, _this.width, _this.height);
        _this.ctxholder.beginPath();
        _this.ctxholder.fillStyle = 'rgb(255, 255, 255)';
        _this.ctxholder.textBaseline = 'middle';
        _this.ctxholder.font = _this.textSize + 'px \'Avenir\', \'Helvetica Neue\', \'Arial\', \'sans-serif\'';
        _this.ctxholder.fillText(item, (_this.width - _this.ctxholder.measureText(item).width) * 0.5, _this.height * 0.5)
        _this.imgData = _this.ctxholder.getImageData(0, 0, _this.width, _this.height);
        _this.getPixelData();
        _this.allstars.push(_this.stars);
      });
    },

    getPixelData: function() {
      this.stars = [];
      for (var w = 0; w < this.width; w += 3) {
        for (var h = 0; h < this.height; h += 3) {
          var index = (w + h * (this.width)) * 4
          if (this.imgData.data[index] > 1) {
            this.stars.push([w, h]);
          }
        }
      }
    },

    getData: function() {
      return this.allstars;
    },

    drawHolders: function() {
      for(var i = 0; i < holderCount; i ++) {
        stars[i] = new StarBoy();
        var x = i % 2 === 0 ? i : i - 1;
        stars[i].draw(x, 50);
        stars[i].setXY(x, 50);
        holdersPos.push({
          x: x,
          y: 50
        });
      }
    }
  }

  function StarBoy() {
    this.starColor = '226,225,142';
    this.r = 1;
    this.fadingOut = false;
    this.fadingIn = true;
    this.opacity = 0;
    this.opacityTresh = 0.5;
    this.do = 0.01;
  }

  StarBoy.prototype = {

    setXY: function(x, y) {
      this.x = x;
      this.y = y;
    },

    fadeIn: function() {
      if(this.fadingIn) {
        this.fadingIn = this.opacity > this.opacityTresh ? false : true;
        this.opacity += this.do;
      }
    },

    fadeOut: function() {
      if(!this.fadingOut) {
        this.fadingOut = this.opacity < 0 ? true : false;
        this.opacity -= this.do;
      }
    },

    draw: function() {
      ctx.beginPath();
      ctx.fillStyle = 'rgba(' + this.starColor + ',' + this.opacity + ')';
      ctx.arc(this.x, this.y, 1, 0, Math.PI * 2, false);
      ctx.closePath();
      ctx.fill();
    },

    move: function(point, length, index) {
      this.fadeIn();
      this.execSpeed([this.x, this.y], point, length, index);
      if(this.speedX >= 0) {
        if(this.x >= point[0]) {
          this.x = point[0];
        } else {
          this.x += this.speedX;
        }
      } else {
        if(this.x <= point[0]) {
          this.x = point[0];
        } else {
          this.x += this.speedX;
        }
      }
      if(this.speedY >= 0) {
        if(this.y >= point[1]) {
          this.y = point[1];
        } else {
          this.y += this.speedY;
        }
      } else {
        if(this.y <= point[1]) {
          this.y = point[1];
        } else {
          this.y += this.speedY;
        }
      }
    },

    execSpeed: function(start, end, length, index) {
      if(hasSpeed) {
        return;
      }
      if(length == index + 1) {
        hasSpeed = true;
      }
      var xGap = end[0] - start[0];
      var yGap = end[1] - start[1];
      this.speedX = xGap / moveCount;
      this.speedY = yGap / moveCount;
    }

  }

  var mp3 = new Audio("./mp3/bgm.mp3");
  mp3.play();

  var words = ['曾在冬夜某个街角与你', '抵着额头借火点燃一支烟', '我叼着它看向你', '看进你的瞳孔里', '看到什么？', '我看到了山川', '我看到了湖泊', '看到了一整片宇宙', '那刹那多么绵长', '像一辈子那么绵长', '我想唤你名', '想打破这寂静', '而我只是想想罢了', '未敢发一声', '这里三千流云向下淌', '那边莺飞草乱长', '可是这些都与你无关', '于是便与我无关', '我以为我看够了阳光', '它泛滥得多廉价而寻常', '直到与你人海相望', '才知我从未曾真的', '见过阳光'];
  var magic = new Magic(words);
  var data = magic.getData();
  magic.drawHolders();

  function draw(pixels, length) {
    ctx.clearRect(0, 0, width, height);
    for(var i = 0; i < length; i ++) {
      stars[i].move(pixels[i], length, i);
      stars[i].draw();
    }
    timer = window.requestAnimationFrame(draw.bind(this, pixels, length));
  };

  words.forEach(function(w, i) {
    setTimeout(function() {
      window.cancelAnimationFrame(timer);
      hasSpeed = false;
      draw(data[i], data[i].length);
    }, i * 6000);
  });

})();
