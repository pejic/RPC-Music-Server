
function logerr( err )
{
  var errlog = document.getElementById( "errlog" );
  errlog.value += err;
}

function logerrln( err )
{
  logerr( err + '\n' );
}

function round_to( x, d )
{
  var tens = Math.pow( 10, d );
  var rounded = Math.round(x * tens)/tens;
  return( rounded );
}

var bawidth = 280;

function createButtonArray( formId, name, min, max, num )
{
  var form = document.getElementById( formId );

  var i;

  var self = new Object();
  self._bwidth = bawidth / num;
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
        this._currentI = k;
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
          logerrln( "Couldn't set the callback.  "
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
          return( this.value_for_i(this.currentI) );
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
  form.appendChild( self.root );

  for (i = 0; i < num; i++) {
    var buttoni = document.createElement("div");
    buttoni.style.width = self._bwidth + 'px';
    buttoni.className = "buttoni";
    buttoni.appendChild( document.createTextNode(
          round_to(self.value_at_i(i), 2) ) );
    self.root.appendChild( buttoni );
    self._buttons[i] = buttoni;

    self._add_button_listener( buttoni, i );
  }

  return( self );
}
