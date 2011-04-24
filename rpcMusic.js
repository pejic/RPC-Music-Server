
function logdbg( err )
{
  var dbglog = document.getElementById( "dbglog" );
  if (dbglog != null) {
    dbglog.value += err;
  }
}

function logclear()
{
  var dbglog = document.getElementById( "dbglog" );
  if (dbglog != null) {
    dbglog.value = "";
  }
}

function logdbgln( err )
{
  logdbg( err + '\n' );
}

function round_to( x, d )
{
  var tens = Math.pow( 10, d );
  var rounded = Math.round(x * tens)/tens;
  return( rounded );
}

function traverseXML( node, spaces )
{
  logdbgln( spaces + "<" + node.nodeName + ">" );
  var i;
  for (i = 0; i < node.childNodes.length; i++) {
    traverseXML( node.childNodes[i], spaces + "  " );
  }
}

function find_childtags( node, tagName )
{
  var cnodes = node.childNodes;
  var i;
  var results = new Array();
  for (i = 0; i < cnodes.length; i++) {
    var cn = cnodes[i];
    if (cn.nodeType == 1 && cn.nodeName == tagName) {
      results.push( cn );
    }
  }
  return (results) ;
}

function find_childtag( node, tagName )
{
  var r = find_childtags( node, tagName );
  if (r.length >= 1) {
    return (r[0]);
  }
  else {
    return null;
  }
}

function get_text_value( node )
{
  var te = node.childNodes[0];
  if (te == null) {
    return "";
  }
  else {
    return (te.nodeValue);
  }
}

function get_soundcards_from_res( res )
{
  var rpcmusic = find_childtag( res, "rpcmusic" );
  var cards = find_childtag( rpcmusic, "soundcards" );
  var scs = find_childtags( cards, "soundcard" ); 
  return (scs);
}

function get_textvalue_from( node, tagname )
{
  var v = find_childtag( node, tagname );
  return( get_text_value( v ) );
}

function get_soundcard_name( sc )
{
  return( get_textvalue_from( sc, "name" ) );
}

function get_soundcard_volume( sc )
{
  return( get_textvalue_from( sc, "volume" ) );
}

function get_players_from_res( res )
{
  var rpcmusic = find_childtag( res, "rpcmusic" );
  var players = find_childtag( rpcmusic, "players" );
  var ps = find_childtags( players, "player" );
  return (ps);
}

function get_player_playerName( player )
{
  return( get_textvalue_from( player, "playerName" ) );
}

function get_player_artist( player )
{
  return( get_textvalue_from( player, "artist" ) );
}

function get_player_title( player )
{
  return( get_textvalue_from( player, "title" ) );
}

function first_non_text( node )
{
  var chs = node.childNodes;
  var i;
  for (i = 0; i < chs.length; i++) {
    if (chs[i].nodeType != 3) { /* 3 = TEXT_NODE */
      return (chs[i]);
    }
  }
  return (null);
}

function next_non_text( node )
{
  var sib = node.nextSibling;
  while(sib != null) {
    if (sib.nodeType != 3) {
      return(sib);
    }
    sib = node.nextSibling;
  };
  return (null);
}

function VolumeControl( pElem, name )
{
  this.root = document.createElement("div");
  this.root.className = 'volumeControl';
  pElem.appendChild( this.root );
  this._nameDiv = document.createElement("div");
  this._nameDiv.className = 'name';
  this._nameText = document.createTextNode(name + ": ");
  this.root.appendChild(this._nameDiv);
  this._nameDiv.appendChild(this._nameText);
  this.name = name;
  this._control = new ButtonArray( this.root, name + "_vol", 0, 100, 11 );
  this._callback = null;
  this._callback_data = null;
  this.set_volume =
      function (v) {
        this._control.set_value(v*100);
      };
  this.get_volume =
      function () {
        this._control.get_value()/100;
      };
  this.set_callback =
      function (cb, data) {
        if (cb == null || (cb != null && typeof(cb) == 'function')) {
          this._callback = cb;
          this._callback_data = data;
        }
      };
  this._proxy_callback =
      function (i, this2) {
        if (this2._callback != null) {
          this2._callback(this2._control.value_at_i(i), this2._callback_data);
        }
      };
  this._control.set_callback( this._proxy_callback, this );
}

/*
 * Pre: elem must be unattached to a parent node.
 */
function wrap_in_div( elem, className )
{
  var dive = document.createElement( "div" );
  dive.className = className;
  dive.appendChild(elem);
  return (dive);
}

function PlayerControl( pElem )
{
  this.root = document.createElement( "div" );
  pElem.appendChild( this.root );
  this.root.className = "audioPlayer";
  this._playerName = document.createTextNode("(playerName)");
  this._artist = document.createTextNode("(artist)");
  this._title = document.createTextNode("(title)");

  this.root.appendChild(wrap_in_div(this._playerName, 'playerName'));
  var songdiv = wrap_in_div(this._artist, 'songline');
  songdiv.appendChild(document.createTextNode(" - "));
  songdiv.appendChild(this._title);
  this.root.appendChild(songdiv);

  var tickDirection = false;
  var tickIntervalMS = 1000/5;
  var tickSpeed = 20 * tickIntervalMS / 1000;
  if (tickSpeed < 1) {
    tickSpeed = 1;
  }
  tickSpeed = Math.round(tickSpeed);
  function tickSongdiv() {
    var iw = songdiv.scrollWidth;
    var w = songdiv.offsetWidth;
    if (w + tickSpeed < iw) {
      var s = songdiv.scrollLeft;
      if (tickDirection) {
        s += tickSpeed;
        if (s + w > iw) {
          tickDirection = !tickDirection;
          s = iw - w;
        }
        songdiv.scrollLeft = s;
      }
      else {
        s -= tickSpeed;
        if (s < 0) {
          tickDirection = !tickDirection;
          s = 0;
        }
        songdiv.scrollLeft = s;
      }
    }
    else {
      songdiv.scrollLeft = 0;
    }
  }

  var tickInterval = null;
  function updateTickInterval() {
    var iw = songdiv.scrollWidth;
    var w = songdiv.offsetWidth;
    if (w + tickSpeed < iw) {
      if (tickInterval == null) {
        tickInterval = setInterval(tickSongdiv, tickIntervalMS);
      }
    }
    else {
      if (tickInterval != null) {
        clearInterval(tickInterval);
        tickInterval = null;
      }
      songdiv.scrollLeft = 0;
    }
  }

  this._callbacks = {};
  this._callbacks_data = {};

  this.set_playerName =
    function (playerName) {
      this._playerName.nodeValue = playerName;
    };

  this.get_playerName =
    function () {
      return (this._playerName.nodeValue);
    };

  this.set_artist =
    function (artist) {
      this._artist.nodeValue = artist;
      updateTickInterval();
    };

  this.get_artist =
    function () {
      return (this._artist.nodeValue);
    };

  this.set_title =
    function (title) {
      this._title.nodeValue = title;
      updateTickInterval();
    };

  this.get_title =
    function () {
      return (this._title.nodeValue);
    };

  var signal_types = ['previous', 'play', 'next'];

  this.set_callback =
    function (signal, cf, data) {
      // TODO : check that signal is in signal_types
      this._callbacks[signal] = cf;
      this._callbacks_data[signal] = data;
    };


  this._callback_proxies = {};
  var this2 = this;
  this._create_callback_proxy =
    function (stype) {
      this2._callback_proxies[stype] =
        function (e) {
          var cb = this2._callbacks[stype];
          if (cb) {
            cb(this2._callbacks_data[stype], this2);
          }
        };
    };
  for (var stypei in signal_types) {
    var stype = signal_types[stypei];
    this._create_callback_proxy(stype);
  }
  var buttonRow = document.createElement("div");
  buttonRow.className = "buttonRow";
  for (var stypei in signal_types) {
    var stype = signal_types[stypei];
    var playdiv = document.createElement("div");
    playdiv.className = stype + "Button";
    var cb_proxy = this._callback_proxies[stype];
    playdiv.addEventListener("click", cb_proxy, null);
    buttonRow.appendChild(playdiv);
  }
  this.root.appendChild(buttonRow);

}

function ButtonArray( pElem, name, min, max, num )
{
  var i;

  this.root = null;
  this.min = min;
  this.max = max;
  this.num = num;
  this._buttons = new Array();
  this._callback = null;
  this._callback_data = null;

  this._update_buttons = 
      function ( k ) {
        var j;
        for (j = 0; j < num; j++) {
          if (j != k) {
            this._buttons[j].className = "buttoni";
          }
          else {
            this._buttons[j].className = "buttoniactive";
          }
        }
      };

  this._currentI = -1;

  this.value_at_i = 
      function (i) {
        var t = (i/(this.num-1));
        var value = (t) * (this.max-this.min) + this.min;
        return( value );
      };

  this.i_for_value =
      function (v) {
        var t = (v - this.min)/(this.max-this.min);
        var n = Math.floor(t * (this.num-1));
        if (n < 0) {
          n = 0;
        }
        else if (n > this.num - 1) {
          n = this.num - 1;
        }
        return( n );
      };

  this.set_value =
      function (v) {
        var i = this.i_for_value( v );
        this._update_buttons( i );
        if (this._callback != null && this._currentI != i) {
          this._currentI = i;
          this._callback( i, this._callback_data );
        }
      };

  this._buttoni_clicked =
      function (i) {
        var v = this.value_at_i( i );
        this.set_value( v );
      };

  this.set_callback =
      function (cb, data) {
        if (cb == null || (cb != null && typeof(cb) == 'function')) {
          this._callback = cb;
          this._callback_data = data;
        }
        else {
          logdbgln( "Couldn't set the callback.  "
              + "The callback must be null or a function taking "
              + "2 parameters (the button index and data)." );
        }
      };

  this.destroy = 
      function () {
        this.root.parentNode.removeChild(this.root);
        this.root = null;
      };

  this.get_value =
      function () {
        if (this.currentI >= 0 && this.currentI < this.num) {
          return( this.value_at_i(this.currentI) );
        }
        return( undefined );
      }

  this._add_button_listener =
      function ( element, isave ) {
        var value = this.value_at_i( isave );
        var this2 = this;
        element.addEventListener( "click", function (e) {
              this2._buttoni_clicked( isave );
            }, false );
      }

  this.root = document.createElement("div");
  this.root.className = "buttonarraybg";
  pElem.appendChild( this.root );

  for (i = 0; i < num; i++) {
    var buttoni = document.createElement("div");
    buttoni.className = "buttoni";
    buttoni.appendChild( document.createTextNode(
          round_to(this.value_at_i(i), 2) ) );
    this.root.appendChild( buttoni );
    this._buttons[i] = buttoni;

    this._add_button_listener( buttoni, i );
  }
}

function Controls( pElem )
{
  this.root = document.createElement("div");
  this.root.className = "controls";
  pElem.appendChild( this.root )

  this.volumes = new Array(); // will hold the volume widgets
  this.players = new Array(); // will hold the player widgets

  this._on_info =
      function (req) {
        if (req.readyState == 4) {
          var rpcDOM = req.responseXML;
          logdbgln(">>>>" + req.responseText);
          if (rpcDOM != null) {
            var soundcards = get_soundcards_from_res( rpcDOM );
            var players = get_players_from_res( rpcDOM );
            // -----------------------------------------
            var pi;
            for (pi = 0; pi < players.length; pi++) {
              var player = players[pi];
              var playerName = get_player_playerName( player );
              var artist = get_player_artist( player );
              var title = get_player_title( player );
              if (this.players.length <= pi) {
                var pctrl = new PlayerControl( this.root );
                this.players.push( pctrl );
              }
              if (this.players.length > pi) {
                var pctrl = this.players[pi];
                pctrl.set_playerName( playerName );
                pctrl.set_artist( artist );
                pctrl.set_title( title );
                pctrl.set_callback("play", this._on_btnpush, "pause");
                pctrl.set_callback("next", this._on_btnpush, "next");
                pctrl.set_callback("previous", this._on_btnpush, "previous");
              }
            }
            // -----------------------------------------
            var ci;
            for (ci = 0; ci < soundcards.length; ci++) {
              var card = soundcards[ci];
              var name = get_soundcard_name( card );
              var vol  = get_soundcard_volume( card );
              if (this.volumes.length > ci) {
                var vctrl = this.volumes[ci];
                vctrl.set_volume( vol );
              }
              else {
                var vctrl = new VolumeControl( this.root, name );
                vctrl.set_volume( vol );
                vctrl.set_callback( this._on_set_volume, vctrl );
                this.volumes.push( vctrl );
              } 
            }
          }
        }
      };

  var this2 = this;
  this._on_set_volume =
      function (volume, vctrl) {
        volume = volume / 100;
        var name = vctrl.name;
        var appendix = "?cmd=set_volume&volume=" + volume + "&card=" + name;
        this2._request_info_raw(appendix);
      };

  this._on_btnpush =
      function (btnname, pctrl) {
        var playerName = pctrl.get_playerName();
        var appendix = "?cmd="+btnname+"&playerName=" + playerName;
        this2._request_info_raw(appendix);
      };

  this._request_info_raw =
      function (appendix) {
        var req = new XMLHttpRequest();
        req.onreadystatechange = function (e) {
          this2._on_info( req );
        }
        req.open("GET", "rpcMusic.pl" + appendix, true);
        req.setRequestHeader("Content-Type", "text/xml");
        req.send("");
      };

  this.request_info =
      function () {
        this._request_info_raw("");
      };

  this.request_info();
}
