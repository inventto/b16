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
        game.initialize();
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

function show(id){ gid(id).setAttribute('style', 'display:block;'); }
function hide(id){ gid(id).setAttribute('style', 'display:none;'); }

var game = {
  initialize: function(){
    game.SIZE = 4;
    game.TIME_SPAN = 10;
    game.drawGrid();
    game.randomBlock();
    game.score = 0;
    game.showCountDownTimer();
    SQLUtil.initialize()
    game.updateRanking();
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
 
        col.addEventListener(isCordova() ? 'touchstart' : 'click',game.validateClick)
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
      if (game.countDownTimer !=null){
        passedTime = (game.TIME_SPAN - ((new Date().getTime() - game.startedAt)/1000)).toFixed(3)
        time.innerHTML = passedTime+"s"
        percent = (passedTime / 30)  * 100
        progress.style.width = percent+"%"
        if (percent <= 0)
          game.onFinishLevel()
      }
    
    }, 30);
    console.log("game countDownTimer interval:: "+game.countDownTimer+" ::")
  
  }, onFinishLevel: function(){
    if (game.countDownTimer!=null){
      console.log("onFinishLevel:: clearInterval("+game.countDownTimer+")")
      clearInterval(game.countDownTimer);
      game.countDownTimer = null;
      SQLUtil.insertScore(game.score);
      game.updateRanking();
    }
  },
  updateRanking: function(){
    SQLUtil.executeSQL("SELECT * FROM scores order by score desc;", function(tx,results){
      rankingTitle = gid("show_ranking")
      rankingTitle.innerHTML = results.rows.length+ " Scores"
      rankingTitle.addEventListener('click',game.showRanking)
      rankingTitle.setAttribute('style', 'display: block')
      
      table = tag("table")
      table.id = "ranking_results"
      table.title = "Ranking Results"
      table.style.backgroundColor = "orange"
      table.setAttribute('style', 'display:none;');
      row = tag("tr")
      row.th = function(name){
        col = tag("th")
        col.innerHTML = name
        this.appendChild(col)
      }
      row.th("id")
      row.th("score")
      row.th("played at")
      thead = tag("thread")
      thead.appendChild(row)
      table.appendChild(thead)
      for (i=0;i<results.rows.length;i++){
        score_item =results.rows.item(i)
        row = tag("tr")
        row.td = function(value){
          col = tag("td")
          col.innerHTML = value
          this.appendChild(col)
        }
        row.td(score_item["id"])
        row.td(score_item["score"])
        row.td(score_item["played_at"])
        row.appendChild(col)
        table.appendChild(row)
      }
      if (old_table =  gid("ranking").querySelector("table#ranking_results")){
        gid("ranking").removeChild(old_table)
      }
      gid("ranking").appendChild(table)
    })
  },
  showRanking: function(){
    show("ranking_results");
    //hide("game");
    gid("show_ranking").innerHTML = "Hide Scores"
    rankingTitle.removeEventListener('click',game.showRanking)
    rankingTitle.addEventListener('click',game.hideRanking)

  }, 
  hideRanking: function(){
    hide("ranking_results");
    show("game");
    gid("show_ranking").innerHTML = "Show Scores"
    rankingTitle.removeEventListener('click',game.hideRanking)
    rankingTitle.addEventListener('click',game.showRanking)
  }
}

var SQLUtil = {
  initialize: function(){
    SQLUtil.db =  window.openDatabase("b16", "1.0", "Scores database", 1000000);
    SQLUtil.executeSQL(SQLUtil.createTableScores());
  },
  createTableScores: function(){
    sql = "CREATE TABLE IF NOT EXISTS scores (";
    sql += " id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ";
    sql += " played_at DATETIME DEFAULT CURRENT_TIMESTAMP,";
    sql += " score INT)";
    return SQLUtil.executeSQL(sql);
  },
  insertScore: function(score){
    return SQLUtil.executeSQL("INSERT INTO scores (score) VALUES ("+score+")");
  },
  executeSQL: function(sql,querySuccess){
    if (sql !== undefined && sql != null){
      console.log("execute sql: "+sql)
      doExecution = function(tx) {
        return tx.executeSql(sql, [], querySuccess);
      }
      onError = function(err) {
        console.log("Error processing SQL: "+sql+">>>"+err.code+": "+err.message);
      }
      onSuccess = function() {
        console.log("db success");
      }
      return SQLUtil.db.transaction( doExecution, onError, onSuccess);
    }
  }

}
