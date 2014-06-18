var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        game.initialize(true);
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
}
function isCordova() {
    return /^file:\/{3}[^\/]/i.test(window.location.href) && /ios|iphone|ipod|ipad|android/i.test(navigator.userAgent);
}

function gid(id){return document.getElementById(id);}
function tag(name){return document.createElement(name);}

var game = {
  initialize: function(){
    if (game.initialized !== undefined)
      return ;
    game.initialized = true;
    game.SIZE = 4;
    game.TIME_SPAN = 30;
    game.drawGrid();
    game.randomBlock();
    game.score = 0;
    game.showCountDownTimer();
  },
  drawGrid: function(){
    table = tag("table");
    table.className = "tabuleiro"
    table.style.borderSize = 1;

    var colHeight = (screen.height / game.SIZE ) * 0.9
    var colWidht = screen.width / game.SIZE
    for (x=0;x<game.SIZE;x++){
      row = tag("tr");
      for (y=0;y<game.SIZE;y++){
        col = tag("td")
        col.innerHTML = " "
        col.attributes.x=x
        col.attributes.y=y
 
        col.addEventListener(isCordova() ? 'touchstart' : 'click',game.validateClick, false)
        col.style.height = colHeight + "px";
        col.style.width = colWidht + "px";
        row.appendChild(col);
      }
      table.appendChild(row);
    }
    gid("game").appendChild(table)
  
  },
  onRightHit: function(){
     game.randomBlock();
     game.score += 1;
     game.showScore();
  
  },
  onWrongHit: function(){
     game.score -= 1;
     game.showScore();
  },
  randomBlock: function(){
    x = 1+parseInt(Math.random() * game.SIZE);
    y = 1+parseInt(Math.random() * game.SIZE);
    where = ".tabuleiro tr:nth-child("+x+") td:nth-child("+y+")"
    console.log(where)
    cell = gid("game").querySelector(where)
    cell.className = "target"
  
  },
  showScore: function(){
    gid("score").innerHTML = game.score;
  }, 
  validateClick: function(e){
    if (e.target.className == "target"){
      cell.className = ""
      game.onRightHit();
    } else{
      game.onWrongHit();
    }
  },
  showCountDownTimer: function(){
    time = gid("time")
    progress = gid("time_progress")
    game.startedAt =  new Date().getTime() ; 
    game.countDownTimer = setInterval(function(){
      passedTime = (game.TIME_SPAN - ((new Date().getTime() - game.startedAt)/1000)).toFixed(3)
      time.innerHTML = passedTime+"s"
      percent = (passedTime / 30)  * 100
      progress.style.width = percent+"%"
      if (percent <= 0)
        game.onFinishLevel()
    
    }, 30);
  
  }, onFinishLevel: function(){
    clearInterval(game.countDownTimer);
    alert("your score is: "+game.score)
  }
}
