
function logdbg( err )
{
  var dbglog = document.getElementById( "dbglog" );
  dbglog.value += err;
}

function logclear()
{
  var dbglog = document.getElementById( "dbglog" );
  dbglog.value = "";
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
  return (te.nodeValue);
}

function get_soundcards_from_res( res )
{
  logdbgln( "res.nodeName = " + res.nodeName );
  var rpcmusic = find_childtag( res, "rpcmusic" );
  logdbgln( "rpcmusic.nodeName = " + rpcmusic.nodeName );
  var cards = find_childtag( rpcmusic, "soundcards" );
  logdbgln( "cards.nodeName = " + cards.nodeName );
  var scs = find_childtags( cards, "soundcard" ); 
  logdbgln( "scs[0].nodeName = " + scs[0].nodeName );
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

function create_volume_control( pElem, name )
{
  var self = new Object();
  self.root = document.createElement("div");
  pElem.appendChild( self.root );
  self.root.appendChild( document.createTextNode(name + ": ") );
  self.root.appendChild( document.createElement("br") );
  self.name = name;
  self._control = create_button_array( self.root, name + "_vol",
      0, 100, 11 );
  self._callback = null;
  self._callback_data = null;
  self.set_volume =
      function (v) {
        this._control.set_value(v*100);
      };
  self.get_volume =
      function () {
        self._control.get_value()/100;
      };
  self.set_callback =
      function (cb, data) {
        if (cb == null || (cb != null && typeof(cb) == 'function')) {
          this._callback = cb;
          this._callback_data = data;
        }
      };
  self._proxy_callback =
      function (i, self2) {
        if (self2._callback != null) {
          self2._callback(self2._control.value_at_i(i), self2._callback_data);
        }
      };
  self._control.set_callback( self._proxy_callback, self );
  return( self );
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

function create_player_control( pElem )
{
  var self = new Object();
  self.root = document.createElement( "div" );
  pElem.appendChild( self.root );
  self.root.className = "audioPlayer";
  self.playerName = document.createTextNode("(playerName)");
  self.artist = document.createTextNode("(artist)");
  self.title = document.createTextNode("(title)");

  self.root.appendChild(wrap_in_div(self.playerName, 'playerName'));
  var songdiv = wrap_in_div(self.artist, 'songline');
  songdiv.appendChild(document.createTextNode(" - "));
  songdiv.appendChild(self.title);
  self.root.appendChild(songdiv);

  self.set_playerName =
    function (playerName) {
      self.playerName.nodeValue = playerName;
    };

  self.set_artist =
    function (artist) {
      self.artist.nodeValue = artist;
    };

  self.set_title =
    function (title) {
      self.title.nodeValue = title;
    };

  return (self);
}

function create_button_array( pElem, name, min, max, num )
{
  var i;

  var self = new Object();
  self.root = null;
  self.min = min;
  self.max = max;
  self.num = num;
  self._buttons = new Array();
  self._callback = null;
  self._callback_data = null;

  self._update_buttons = 
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
        if (this._callback != null && this._currentI != k) {
          this._callback( k, this._callback_data );
        }
      };

  self._currentI = -1;

  self.value_at_i = 
      function (i) {
        var t = (i/(this.num-1));
        var value = (t) * (this.max-this.min) + this.min;
        return( value );
      };

  self.i_for_value =
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

  self.set_value =
      function (v) {
        var i = self.i_for_value( v );
        self._update_buttons( i );
      };

  self.set_callback =
      function (cb, data) {
        if (cb == null || (cb != null && typeof(cb) == 'function')) {
          self._callback = cb;
          self._callback_data = data;
        }
        else {
          logdbgln( "Couldn't set the callback.  "
              + "The callback must be null or a function taking "
              + "2 parameters (the button index and data)." );
        }
      };

  self.destroy = 
      function () {
        this.root.parentNode.removeChild(this.root);
        this.root = null;
      };

  self.get_value =
      function () {
        if (this.currentI >= 0 && this.currentI < this.num) {
          return( this.value_at_i(this.currentI) );
        }
        return( undefined );
      }

  self._add_button_listener =
      function ( element, isave ) {
        var value = this.value_at_i( isave );
        var self2 = this;
        element.addEventListener( "click", function (e) {
              self2._update_buttons( isave );
            }, false );
      }

  self.root = document.createElement("div");
  self.root.className = "buttonarraybg";
  pElem.appendChild( self.root );

  for (i = 0; i < num; i++) {
    var buttoni = document.createElement("div");
    buttoni.className = "buttoni";
    buttoni.appendChild( document.createTextNode(
          round_to(self.value_at_i(i), 2) ) );
    self.root.appendChild( buttoni );
    self._buttons[i] = buttoni;

    self._add_button_listener( buttoni, i );
  }

  return( self );
}

function create_controls( pElem )
{
  var self = new Object();
  self.root = document.createElement("div");
  self.root.className = "controls";
  pElem.appendChild( self.root )

  self.volumes = new Array(); // will hold the volume widgets
  self.players = new Array(); // will hold the player widgets

  self._on_info =
      function (req) {
        if (req.readyState == 4) {
          logdbgln( "Got data: " + req.responseText );
          var rpcDOM = req.responseXML;
          var soundcards = get_soundcards_from_res( rpcDOM );
          var players = get_players_from_res( rpcDOM );
          var ci;
          for (ci = 0; ci < soundcards.length; ci++) {
            var card = soundcards[ci];
            logdbgln( "card.nodeName = " + card.nodeName );
            var name = get_soundcard_name( card );
            var vol  = get_soundcard_volume( card );
            logdbgln( "name = " + name + "; vol = " + vol );
            if (self.volumes.length > ci) {
              self.volumes[ci].set_value( vol );
            }
            else {
              if (ci > 0) {
                //self.root.appendChild( document.createElement("br") );
              }
              var vctrl = create_volume_control( self.root, name );
              vctrl.set_volume( vol );
              vctrl.set_callback( self._on_set_volume, vctrl );
              self.volumes.push( vctrl );
            } 
          }
          var pi;
          for (pi = 0; pi < players.length; pi++) {
            var player = players[pi];
            var playerName = get_player_playerName( player );
            var artist = get_player_artist( player );
            var title = get_player_title( player );
            if (self.players.length <= pi) {
              var pctrl = create_player_control( self.root );
              self.players.push( pctrl );
            }
            if (self.players.length > pi) {
              var pctrl = self.players[pi];
              pctrl.set_playerName( playerName );
              pctrl.set_artist( artist );
              pctrl.set_title( title );
            }
          }
        }
      };

  self._on_set_volume =
      function (volume, vctrl) {
        volume = volume / 100;
        var name = vctrl.name;
        var appendix = "?cmd=set_volume&volume=" + volume + "&card=" + name;
        self._request_info_raw(appendix);
      };

  self._request_info_raw =
      function (appendix) {
        var req = new XMLHttpRequest();
        req.onreadystatechange = function (e) {
          self._on_info( req );
        }
        req.open("GET", "rpcMusic.pl" + appendix, true);
        req.setRequestHeader("Content-Type", "text/xml");
        req.send("");
      };

  self.request_info =
      function () {
  self._request_info_raw("");
      };

  self.request_info();
}
