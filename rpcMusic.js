
/*
 * Logs the given message if the logging textarea is present.
 *
 * \param err string containing the error message.
 */
function logdbg( err )
{
  var dbglog = document.getElementById( "dbglog" );
  if (dbglog != null) {
    dbglog.value += err;
  }
}

/*
 * Clears the error log.
 */
function logclear()
{
  var dbglog = document.getElementById( "dbglog" );
  if (dbglog != null) {
    dbglog.value = "";
  }
}

/*
 * Same as logdbg but adds a newline at the end.
 *
 * \param err string containing the error message.
 */
function logdbgln( err )
{
  logdbg( err + '\n' );
}

/*
 * Rounds x to d decimal places.
 *
 * \param x the number to round.
 * \param d the number of decimal places to keep.
 */
function round_to( x, d )
{
  var tens = Math.pow( 10, d );
  var rounded = Math.round(x * tens)/tens;
  return( rounded );
}

/*
 * Traverses an XML tree recursively printing it to the debug log.
 *
 * \param node the DOM node to print from.
 * \param spaces a string containing the spaces that will be added to the
 *        beginning of each printed line.  This makes indenting the XML tree
 *        possible.
 */
function traverseXML( node, spaces )
{
  logdbgln( spaces + "<" + node.nodeName + ">" );
  var i;
  for (i = 0; i < node.childNodes.length; i++) {
    traverseXML( node.childNodes[i], spaces + "  " );
  }
}

/*
 * Finds all XML nodes that are children of node and have the given tag name.
 *
 * \param node the node which's children will be searched.
 * \param tagName the name of the tag to be matched.
 */
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

/*
 * Finds the first child with given tag.
 *
 * \param node the node which's children will be searched.
 * \param tagName the tag name to be matched.
 */
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

/*
 * Returns the text from an XML node.
 *
 * \param node the node that contains the text node.
 */
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

/*
 * Returns the soundcards from the result of a server info query.
 *
 * \param res the result received from the server.
 */
function get_soundcards_from_res( res )
{
  var rpcmusic = find_childtag( res, "rpcmusic" );
  var cards = find_childtag( rpcmusic, "soundcards" );
  var scs = find_childtags( cards, "soundcard" ); 
  return (scs);
}

/*
 * Returns the text from a child node of the given tag name.
 *
 * \param node the node which's children will be searched.
 * \param tagname the tag name to be matched.
 */
function get_textvalue_from( node, tagname )
{
  var v = find_childtag( node, tagname );
  return( get_text_value( v ) );
}

/*
 * Returns the sound card name from a soundcard XML node.
 *
 * \param sc an XML node.
 */
function get_soundcard_name( sc )
{
  return( get_textvalue_from( sc, "name" ) );
}

/*
 * Returns the sound card volume from a soundcard XML node.
 *
 * \param sc an XML node.
 */
function get_soundcard_volume( sc )
{
  return( get_textvalue_from( sc, "volume" ) );
}

/*
 * Returns all music players from a result of a server info query.
 *
 * \param res the result received from the server.
 */
function get_players_from_res( res )
{
  var rpcmusic = find_childtag( res, "rpcmusic" );
  var players = find_childtag( rpcmusic, "players" );
  var ps = find_childtags( players, "player" );
  return (ps);
}

/*
 * Returns the music player's name.
 *
 * \param player the XML node representing a music player.
 */
function get_player_playerName( player )
{
  return( get_textvalue_from( player, "playerName" ) );
}

/*
 * Returns the music player's current track's artist.
 *
 * \param player the XML node representing a music player.
 */
function get_player_artist( player )
{
  return( get_textvalue_from( player, "artist" ) );
}

/*
 * Returns the music player's current track's title.
 *
 * \param player the XML node representing a music player.
 */
function get_player_title( player )
{
  return( get_textvalue_from( player, "title" ) );
}

/*
 * Returns the first child node that is not a text node.
 *
 * \param node the XML node which's children will be searched. 
 */
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

/*
 * Returns the next sibling of node that is not a text node.
 *
 * \param node the XML node for which the next sibling will be found.
 */
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

/*
 * Constructor for a new volume control widget.  The widget is appended to
 * pElem.  The name member is set to name.
 *
 * \param pElem the parent element.
 * \param name the name of the volume control.  This should be a name received
 *        from the server.
 */
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
  this._control = new ButtonArray( this.root, 0, 100, 11 );
  this._callback = null;
  this._callback_data = null;

  /*
   * Set the volume to v.
   *
   * \param v the new volume in the range [0:1];
   */
  this.set_volume =
      function (v) {
        this._control.set_value(v*100);
      };

  /*
   * Returns the current volume in the range [0:1].
   */
  this.get_volume =
      function () {
        this._control.get_value()/100;
      };

  /*
   * Set the function that will be called when the volume changes.
   *
   * \param cb the callback function that takes two parameters. The first
   *        parameter is the volume, and the second is the data parameter you
   *        pass to set_callback.
   * \param data a parameter that is passed to your callback function.
   */
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
 * Wraps the given element in a div, and sets the div's class attribute.
 *
 * \param elem an element that is already attached in the DOM somewhere.
 * \param className the class that the new div's class attribute is set to.
 */
function wrap_in_div( elem, className )
{
  var dive = document.createElement( "div" );
  dive.className = className;
  dive.appendChild(elem);
  return (dive);
}

/*
 * Constructor for a widget that controls the playback of a music player.
 *
 * \param pElem the parent element to which the player widget will be attached
 *        to.
 */
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

  /*
   * Function that moves the song artist and title back and forth when the
   * whole text cannot fit.
   */
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

  /*
   * Signals that callbacks can listen for.
   */
  var signal_types = ['previous', 'play', 'next'];

  /*
   * Sets the callback for a given signal.
   *
   * \param signal the signal that the callback listens for.
   * \param cf your callback function.
   * \param data the data to be passed to your callback function.
   */
  this.set_callback =
    function (signal, cf, data) {
      // TODO : check that signal is in signal_types
      this._callbacks[signal] = cf;
      this._callbacks_data[signal] = data;
    };


  /*
   * Here we set up proxy callback functions for each type of signal.
   */
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

  /*
   * Here we create buttons for each signal, and connect them to the proxy
   * callback functions.
   */
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

/*
 * Constructor for an array of buttons that are numbered.  This is intended for
 * the volume control widget.
 *
 * \param pElem the node to which the new button array will be attached.
 * \param min the minumum value of the range for this widget.
 * \param max the maximum value of the range for this widget.
 * \param num the number of buttons to create.
 */
function ButtonArray( pElem, min, max, num )
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

  /*
   * Given the index returns the value at that index.
   *
   * \param i the index of the button.
   */
  this.value_at_i = 
      function (i) {
        var t = (i/(this.num-1));
        var value = (t) * (this.max-this.min) + this.min;
        return( value );
      };

  /*
   * Given the value within the range returns the button index.
   *
   * \param v the value of the button.
   */
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

  /*
   * Sets the value of the button array.  This switches the selected button if
   * the button index changes.
   *
   * \param v value to be set.
   */
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

  /*
   * Sets a callback that is called when the selected button changes.
   *
   * \param cb your callback function that takes two parameters: the index of
   *        the selected button, and the data variable you pass to
   *        set_callback.
   * \param data a variable to be passed to your callback function.
   */
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

  /*
   * Removes itself from the DOM.
   */
  this.destroy = 
      function () {
        this.root.parentNode.removeChild(this.root);
        this.root = null;
      };

  /*
   * Returns the value of the currently selected button.
   */
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


/*
 * Constructor for all the controls on the page.  The page is built dynamically
 * from the query to the server.  The server determines which music player
 * controls are show, and which volume controls are show.
 *
 * \param pElem the parent element to which the controls will be appended.
 */
function Controls( pElem )
{
  this.root = document.createElement("div");
  this.root.className = "controls";
  pElem.appendChild( this.root )

  this.volumes = new Array(); // will hold the volume widgets
  this.players = new Array(); // will hold the player widgets

  /*
   * Handles the server's data, to build or update the UI.
   */
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
