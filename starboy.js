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

    // 得到所有需要显示文字的像素信息
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

    // 得到文字的像素信息。
    // 每个像素点用data来表示的话，data是一个包含四个元素的数组。
    // rgba = 'rgba(' + data[0] + ', ' + data[1] +', ' + data[2] + ', ' + (data[3] / 255) + ')';
    // 因此我们通过data[3]是否大于0来判断该像素点是否有显示像素, (大于0表示不透明，即存在像素)
    getPixelData: function() {
      this.stars = [];
      // 每隔3个像素记录一次，不然像素点太密集，没颗粒感。
      for (var w = 0; w < this.width; w += 3) {
        for (var h = 0; h < this.height; h += 3) {
          var index = (w + h * (this.width)) * 4
          if (this.imgData.data[index] > 0) {
            this.stars.push([w, h]);
          }
        }
      }
    },

    getData: function() {
      return this.allstars;
    },

    // 提前在画布上放置一定数目的点，这里我们预置1600个就足够。
    // 预置的粒子初始透明度都置为0。
    drawHolders: function() {
      for(var i = 0; i < holderCount; i ++) {
        stars[i] = new StarBoy();
        // var x = i % 2 === 0 ? i : i - 1;
        stars[i].draw(400, 60);
        stars[i].setXY(400, 60);
        holdersPos.push({
          x: 400,
          y: 60
        });
      }
    }
  }

  function StarBoy() {
    this.starColor = '226,225,142'; // 粒子颜色
    this.r = 1; // 粒子半径
    this.fadingOut = false; // 是否进行fadeOut函数
    this.fadingIn = true; // 是否进行fadeIn函数
    this.opacity = 0; // 粒子透明度
    this.opacityTresh = 0.6; // 粒子最大透明度
    this.do = 0.01; // 透明度变化速率
  }

  StarBoy.prototype = {

    // 设置star实例内部x, y
    setXY: function(x, y) {
      this.x = x;
      this.y = y;
    },

    // star进行fadeIn，透明度渐增
    fadeIn: function() {
      if(this.fadingIn) {
        this.fadingIn = this.opacity > this.opacityTresh ? false : true;
        this.opacity += this.do;
      }
    },

    // star进行fadeIn，透明度渐减
    fadeOut: function() {
      if(!this.fadingOut) {
        this.fadingOut = this.opacity < 0 ? true : false;
        this.opacity -= this.do;
      }
    },

    // 绘制粒子
    draw: function() {
      ctx.beginPath();
      ctx.fillStyle = 'rgba(' + this.starColor + ',' + this.opacity + ')';
      ctx.arc(this.x, this.y, 1, 0, Math.PI * 2, false);
      ctx.closePath();
      ctx.fill();
    },

    // 对粒子位置进行变换
    move: function(point, length, index) {
      this.fadeIn();
      // 计算的到speedX和speedY，以备变换使用。
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

    // 通过传入上一个点和下一个点的位置来计算x轴和y轴的变换速度
    // 该值一次变换只计算一次，所以用一个flag来限制。
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
      // 在进行下次变换的时候，记得清空上次变换的动画。
      window.cancelAnimationFrame(timer);
      hasSpeed = false;
      draw(data[i], data[i].length);
    }, i * 6000);
  });

})();
