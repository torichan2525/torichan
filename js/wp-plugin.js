//・・・・・・・・・・・・leaflet navi・・・・・・・・・・・・・//

L.Control.Window = L.Control.extend({

    includes: L.Evented.prototype || L.Mixin.Events,

    options: {
        element: 'map',
        className: 'control-window',
        visible: false,
        title: undefined,
        closeButton: true,
        content: undefined,
        prompt: undefined,
        maxWidth: 300,
        modal: false,
        position: 'center',
        autoClose: true, // New option for automatic closing
        autoCloseTime: 10000, // New option for auto-close duration (in milliseconds)
    },
    initialize: function (container, options) {
        var self = this;

        if (container.hasOwnProperty('options')) { container = container.getContainer(); }

        options.element = container;
        L.setOptions(this, options);

        var modality = 'nonmodal';

        if (this.options.modal){
            modality = 'modal'
        }


        // Make sure we don't drag the map when we interact with the content
        var stop = L.DomEvent.stopPropagation;
        L.DomEvent
            .on(this._wrapper, 'contextmenu', stop)
            .on(this._wrapper, 'click', stop)
            .on(this._wrapper, 'mousedown', stop)
            .on(this._wrapper, 'touchstart', stop)
            .on(this._wrapper, 'dblclick', stop)
            .on(this._wrapper, 'mousewheel', stop)
            .on(this._wrapper, 'MozMousePixelScroll', stop)

        // Attach event to close button
        if (this.options.closeButton) {
            var close = this._closeButton;
            L.DomEvent.on(close, 'click', this.hide, this);
        }
        if (this.options.title){
            this.title(this.options.title);
        }
        if (this.options.content) {
            this.content(this.options.content);
        }
        if (typeof(this.options.prompt)=='object') {
            this.prompt(this.options.prompt);
        }
        if (this.options.visible){
            this.show();
        }
    // Handle auto-close if enabled
    if (this.options.autoClose) {
        setTimeout(function() {
          self.close();
        }, this.options.autoCloseTime);
      }

        //map.on('resize',function(){self.mapResized()});
    },
    disableBtn: function(){
			this._btnOK.disabled=true;
			this._btnOK.className='disabled';
	},
	enableBtn: function(){
			this._btnOK.disabled=false;
			this._btnOK.className='';
	},
    title: function(titleContent){
        if (titleContent==undefined){
            return this.options.title
        }

        this.options.title = titleContent;
        var title = titleContent || '';
        this.titleContent.innerHTML = title;
        return this;
    },
    remove: function () {

        L.DomUtil.get(this.options.element).removeChild(this._wrapper);

        // Unregister events to prevent memory leak
        var stop = L.DomEvent.stopPropagation;
        L.DomEvent
            .off(this._wrapper, 'contextmenu', stop)
            .off(this._wrapper, 'click', stop)
            .off(this._wrapper, 'mousedown', stop)
            .off(this._wrapper, 'touchstart', stop)
            .off(this._wrapper, 'dblclick', stop)
            .off(this._wrapper, 'mousewheel', stop)
            .off(this._wrapper, 'MozMousePixelScroll', stop);

       // map.off('resize',self.mapResized);

        if (this._closeButton && this._close) {
            var close = this._closeButton;
            L.DomEvent.off(close, 'click', this.close, this);
        }
        return this;
    },
    mapResized : function(){
      // this.show()
    },
    show: function (position) {

        if (position){
            this.options.position = position
        }

        L.DomUtil.addClass(this._wrapper, 'visible');


        this.setContentMaxHeight();
        var thisWidth = this._container.offsetWidth;
        var thisHeight = this._container.offsetHeight;
        var margin = 8;

        var el =  L.DomUtil.get(this.options.element);
        var rect = el.getBoundingClientRect();
        var width = rect.right -rect.left ||  Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        var height = rect.bottom -rect.top ||  Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

        var top = rect.top;
        var left = rect.left;
        var offset =0;

        // SET POSITION OF WINDOW
        if (this.options.position == 'topLeft'){
            this.showOn([left,top+offset])
            } else if (this.options.position == 'left') {
            this.showOn([left, top+height/2-thisHeight/2-margin+offset])
        } else if (this.options.position == 'bottomLeft') {
            this.showOn([left, top+height-thisHeight-margin*2-offset])
        } else if (this.options.position == 'top') {
            this.showOn([left+width/2-thisWidth/2-margin,top+offset])
        } else if (this.options.position == 'topRight') {
            this.showOn([left+width-thisWidth-margin*2,top+ offset])
        } else if (this.options.position == 'right') {
            this.showOn([left+width-thisWidth-margin*2, top+height/2-thisHeight/2-margin+offset])
        } else if (this.options.position == 'bottomRight') {
            this.showOn([left+width-thisWidth-margin*2,top+ height-thisHeight-margin*2-offset])
        } else if (this.options.position == 'bottom') {
            this.showOn([left+width/2-thisWidth/2-margin,top+ height-thisHeight-margin*2-offset])
        } else {
            this.showOn([left+width/2-thisWidth/2-margin, top+top+height/2-thisHeight/2-margin+offset])
        }

        return this;
    },
    showOn: function(point){

        this.setContentMaxHeight();
        L.DomUtil.setPosition(this._container, L.point(Math.round(point[0]),Math.round(point[1]),true));

        var draggable = new L.Draggable(this._container,this._containerTitleBar);
        draggable.enable();

        L.DomUtil.addClass(this._wrapper, 'visible');
        this.fire('show');
        return this;
    },
    hide: function (e) {

        L.DomUtil.removeClass(this._wrapper, 'visible');
        this.fire('hide');
        return this;
    },

    getContainer: function () {
        return this._containerContent;
    },
    content: function (content) {
        if (content==undefined){
            return this.options.content
        }
        this.options.content = content;
        this.getContainer().innerHTML = content;
        return this;
    },
    prompt : function(promptObject){

        if (promptObject==undefined){
            return this.options.prompt
        }

        this.options.prompt = promptObject;

        this.setPromptCallback(promptObject.callback);
        
        this.setActionCallback(promptObject.action);

        var cancel = this.options.prompt.buttonCancel || undefined;

        var ok = this.options.prompt.buttonOK || 'OK';

        var action = this.options.prompt.buttonAction || undefined;

        if (action != undefined) {
            var btnAction = L.DomUtil.create('button','',this._containerPromptButtons);
            L.DomEvent.on(btnAction, 'click',this.action, this);
            btnAction.innerHTML=action;
        }

        var btnOK= L.DomUtil.create('button','',this._containerPromptButtons);
        L.DomEvent.on(btnOK, 'click',this.promptCallback, this);
        btnOK.innerHTML=ok;
        
        this._btnOK=btnOK;
        
        if (cancel != undefined) {
	        var btnCancel= L.DomUtil.create('button','',this._containerPromptButtons);
	        L.DomEvent.on(btnCancel, 'click', this.close, this);
	        btnCancel.innerHTML=cancel
        }

        return this;
    },
    container : function(containerContent){
        if (containerContent==undefined){
            return this._container.innerHTML
        }

        this._container.innerHTML = containerContent;

        if (this.options.closeButton) {
            this._closeButton = L.DomUtil.create('a', 'close',this._container);
            this._closeButton.innerHTML = '&times;';
            L.DomEvent.on(this._closeButton, 'click', this.close, this);
        }
        return this;

    },
    setPromptCallback : function(callback){
        var self = this;
        if (typeof(callback)!= 'function') { callback = function() {console.warn('No callback function specified!');}}
        var cb = function() { self.close();callback();};
        this.promptCallback = cb;
        return this;
    },
    setActionCallback : function(callback){
        var self = this;
        if (typeof(callback)!= 'function') { callback = function() {console.warn('No callback function specified!');}}
        var cb = function() { self.hide();callback();};
        this.action = cb;
        return this;
    },

    setContentMaxHeight : function(){
        var margin = 68;

        if (this.options.title){
            margin += this._containerTitleBar.offsetHeight-36;
        }
        if (typeof(this.options.prompt) == 'object'){
            margin += this._containerPromptButtons.offsetHeight-20
        }

        var el =  L.DomUtil.get(this.options.element)
        var rect = el.getBoundingClientRect();
        var height = rect.bottom -rect.top;

        var maxHeight = height - margin;
        this._containerContent.setAttribute('style','max-height:'+maxHeight+'px')
    },
    close : function(){
        this.hide();
        this.remove();
        this.fire('close');
        return undefined;
    }
});

L.control.window = function (container,options) {
    return new L.Control.Window(container,options);
};

//・・・・・・・・・・・・leaflet navi・・・・・・・・・・・・・//



//・・・・・・・・・・・・leaflet edgemarker・・・・・・・・・・・・・//

(function(L) {
  'use strict';
  var classToExtend = 'Class';
  if (L.version.charAt(0) !== '0') {
    classToExtend = 'Layer';
  }

  L.EdgeMarker = L[classToExtend].extend({
    options: {
      distanceOpacity: false,
      distanceOpacityFactor: 4,
      layerGroup: null,
      rotateIcons: true,
      findEdge : function (map){
        return L.bounds([0,0], map.getSize());
      },
      icon: L.icon({
        iconUrl: L.Icon.Default.imagePath + '/edge-arrow-marker.png',
        clickable: true,
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      })
    },

    initialize: function(options) {
      L.setOptions(this, options);
    },

    addTo: function(map) {
      this._map = map;

      // add a method to get applicable features
      if (typeof map._getFeatures !== 'function') {
        L.extend(map, {
          _getFeatures: function() {
            var out = [];
            for (var l in this._layers) {
              if (typeof this._layers[l].getLatLng !== 'undefined') {
                out.push(this._layers[l]);
              }
            }
            return out;
          }
        });
      }

      map.on('move', this._addEdgeMarkers, this);
      map.on('viewreset', this._addEdgeMarkers, this);

      this._addEdgeMarkers();

      map.addLayer(this);

      return this;
    },

    destroy: function() {
      if (this._map && this._borderMarkerLayer) {
        this._map.off('move', this._addEdgeMarkers, this);
        this._map.off('viewreset', this._addEdgeMarkers, this);

        this._borderMarkerLayer.clearLayers();
        this._map.removeLayer(this._borderMarkerLayer);

        delete this._map._getFeatures;

        this._borderMarkerLayer = undefined;
      }
    },

    onClick: function(e) {
      this._map.setView(e.target.options.latlng, this._map.getZoom());
    },

    onAdd: function() {},

    _borderMarkerLayer: undefined,

    _addEdgeMarkers: function() {
      if (typeof this._borderMarkerLayer === 'undefined') {
        this._borderMarkerLayer = new L.LayerGroup();
      }
      this._borderMarkerLayer.clearLayers();

      var features = [];
      if (this.options.layerGroup != null) {
        features = this.options.layerGroup.getLayers();
      } else {
        features = this._map._getFeatures();
      }

      var mapPixelBounds = this.options.findEdge(this._map);

      var markerWidth = this.options.icon.options.iconSize[0];
      var markerHeight = this.options.icon.options.iconSize[1];

      for (var i = 0; i < features.length; i++) {
        var currentMarkerPosition = this._map.latLngToContainerPoint(
          features[i].getLatLng()
        );

        if (currentMarkerPosition.y < mapPixelBounds.min.y ||
          currentMarkerPosition.y > mapPixelBounds.max.y ||
          currentMarkerPosition.x > mapPixelBounds.max.x ||
          currentMarkerPosition.x < mapPixelBounds.min.x
        ) {
          // get pos of marker
          var x = currentMarkerPosition.x;
          var y = currentMarkerPosition.y;
          var markerDistance;

          // we want to place EdgeMarker on the line from center screen to target,
          // and against the border of the screen
          // we know angel and its x or y cordiante
          // (depending if we want to place it against top/bottom edge or left right edge)
          // fromthat we can calculate the other cordinate
          var center = mapPixelBounds.getCenter();

          var rad = Math.atan2(center.y - y, center.x - x);
          var rad2TopLeftcorner = Math.atan2(center.y-mapPixelBounds.min.y,center.x-mapPixelBounds.min.x);

          // target is in between diagonals window/ hourglass
          // more out in y then in x
          if (Math.abs(rad) > rad2TopLeftcorner && Math.abs (rad) < Math.PI -rad2TopLeftcorner) {

            // bottom out
            if (y < center.y ){
              y = mapPixelBounds.min.y + markerHeight/2;
              x = center.x -  (center.y-y) / Math.tan(Math.abs(rad));
              markerDistance = currentMarkerPosition.y - mapPixelBounds.y;
            // top out
            }else{
              y = mapPixelBounds.max.y - markerHeight/2;
              x = center.x - (y-center.y)/ Math.tan(Math.abs(rad));
              markerDistance = -currentMarkerPosition.y;
            }
          }else {

            // left out
            if (x < center.x ){
              x = mapPixelBounds.min.x + markerWidth/2;
              y = center.y -  (center.x-x ) *Math.tan(rad);
              markerDistance = -currentMarkerPosition.x;
            // right out
            }else{
              x = mapPixelBounds.max.x - markerWidth/2;
              y = center.y +  (x - center.x) *Math.tan(rad);
              markerDistance = currentMarkerPosition.x - mapPixelBounds.x;
            }
          }
          // correction so that is always has same distance to edge

          // top out (top has y=0)
          if (y < mapPixelBounds.min.y + markerHeight/2) {
            y = mapPixelBounds.min.y + markerHeight/2;
            // bottom out
          }
          else if (y > mapPixelBounds.max.y - markerHeight/2) {
            y = mapPixelBounds.max.y - markerHeight/2 ;
          }
          // right out
          if (x > mapPixelBounds.max.x - markerWidth / 2) {
            x = mapPixelBounds.max.x - markerWidth / 2;
            // left out
          } else if (x < markerWidth / 2) {
            x = mapPixelBounds.min.x + markerWidth / 2;
          }

          // change opacity on distance
          var newOptions = this.options;
          if (this.options.distanceOpacity) {
            newOptions.fillOpacity =
              (100 - markerDistance / this.options.distanceOpacityFactor) / 100;
          }

          // rotate markers
          if (this.options.rotateIcons) {
            var angle = rad / Math.PI * 180;
            newOptions.angle = angle;
          }

          var ref = { latlng: features[i].getLatLng() };
          newOptions = L.extend({}, newOptions, ref);

          var marker = L.rotatedMarker(
            this._map.containerPointToLatLng([x, y]),
            newOptions
          ).addTo(this._borderMarkerLayer);

          marker.on('click', this.onClick, marker);
        }
      }
      if (!this._map.hasLayer(this._borderMarkerLayer)) {
        this._borderMarkerLayer.addTo(this._map);
      }
    }
  });

  /*
   * L.rotatedMarker class is taken from https://github.com/bbecquet/Leaflet.PolylineDecorator.
   */
  L.RotatedMarker = L.Marker.extend({
    options: {
      angle: 0
    },

    statics: {
      TRANSFORM_ORIGIN: L.DomUtil.testProp([
        'transformOrigin',
        'WebkitTransformOrigin',
        'OTransformOrigin',
        'MozTransformOrigin',
        'msTransformOrigin'
      ])
    },

    _initIcon: function() {
      L.Marker.prototype._initIcon.call(this);

      this._icon.style[L.RotatedMarker.TRANSFORM_ORIGIN] = '50% 50%';
    },

    _setPos: function(pos) {
      L.Marker.prototype._setPos.call(this, pos);

      if (L.DomUtil.TRANSFORM) {
        // use the CSS transform rule if available
        this._icon.style[L.DomUtil.TRANSFORM] +=
          ' rotate(' + this.options.angle + 'deg)';
      } else if (L.Browser.ie) {
        // fallback for IE6, IE7, IE8
        var rad = this.options.angle * (Math.PI / 180),
          costheta = Math.cos(rad),
          sintheta = Math.sin(rad);
        this._icon.style.filter +=
          " progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand', M11=" +
          costheta +
          ', M12=' +
          -sintheta +
          ', M21=' +
          sintheta +
          ', M22=' +
          costheta +
          ')';
      }
    },

    setAngle: function(ang) {
      this.options.angle = ang;
    }
  });

  L.rotatedMarker = function(pos, options) {
    return new L.RotatedMarker(pos, options);
  };

  L.edgeMarker = function(options) {
    return new L.EdgeMarker(options);
  };
})(L);
//・・・・・・・・・・・・leaflet edgemarker・・・・・・・・・・・・・//



//・・・・・・・・・・・・SmoothWheelZoom・・・・・・・・・・・・・//



L.Map.mergeOptions({
    // @section Mousewheel options
    // @option smoothWheelZoom: Boolean|String = true
    // Whether the map can be zoomed by using the mouse wheel. If passed `'center'`,
    // it will zoom to the center of the view regardless of where the mouse was.
    smoothWheelZoom: true,

    // @option smoothWheelZoom: number = 1
    // setting zoom speed
    smoothSensitivity:1

});


L.Map.SmoothWheelZoom = L.Handler.extend({

    addHooks: function () {
        L.DomEvent.on(this._map._container, 'wheel', this._onWheelScroll, this);
    },

    removeHooks: function () {
        L.DomEvent.off(this._map._container, 'wheel', this._onWheelScroll, this);
    },

    _onWheelScroll: function (e) {
        if (!this._isWheeling) {
            this._onWheelStart(e);
        }
        this._onWheeling(e);
    },

    _onWheelStart: function (e) {
        var map = this._map;
        this._isWheeling = true;
        this._wheelMousePosition = map.mouseEventToContainerPoint(e);
        this._centerPoint = map.getSize()._divideBy(2);
        this._startLatLng = map.containerPointToLatLng(this._centerPoint);
        this._wheelStartLatLng = map.containerPointToLatLng(this._wheelMousePosition);
        this._startZoom = map.getZoom();
        this._moved = false;
        this._zooming = true;

        map._stop();
        if (map._panAnim) map._panAnim.stop();

        this._goalZoom = map.getZoom();
        this._prevCenter = map.getCenter();
        this._prevZoom = map.getZoom();

        this._zoomAnimationId = requestAnimationFrame(this._updateWheelZoom.bind(this));
    },

    _onWheeling: function (e) {
        var map = this._map;

        this._goalZoom = this._goalZoom + L.DomEvent.getWheelDelta(e) * 0.003 * map.options.smoothSensitivity;
        if (this._goalZoom < map.getMinZoom() || this._goalZoom > map.getMaxZoom()) {
            this._goalZoom = map._limitZoom(this._goalZoom);
        }
        this._wheelMousePosition = this._map.mouseEventToContainerPoint(e);

        clearTimeout(this._timeoutId);
        this._timeoutId = setTimeout(this._onWheelEnd.bind(this), 200);

        L.DomEvent.preventDefault(e);
        L.DomEvent.stopPropagation(e);
    },

    _onWheelEnd: function (e) {
        this._isWheeling = false;
        cancelAnimationFrame(this._zoomAnimationId);
        this._map._moveEnd(true);
    },

    _updateWheelZoom: function () {
        var map = this._map;

        if ((!map.getCenter().equals(this._prevCenter)) || map.getZoom() != this._prevZoom)
            return;

        this._zoom = map.getZoom() + (this._goalZoom - map.getZoom()) * 0.3;
        this._zoom = Math.floor(this._zoom * 100) / 100;

        var delta = this._wheelMousePosition.subtract(this._centerPoint);
        if (delta.x === 0 && delta.y === 0)
            return;

        if (map.options.smoothWheelZoom === 'center') {
            this._center = this._startLatLng;
        } else {
            this._center = map.unproject(map.project(this._wheelStartLatLng, this._zoom).subtract(delta), this._zoom);
        }

        if (!this._moved) {
            map._moveStart(true, false);
            this._moved = true;
        }

        map._move(this._center, this._zoom);
        this._prevCenter = map.getCenter();
        this._prevZoom = map.getZoom();

        this._zoomAnimationId = requestAnimationFrame(this._updateWheelZoom.bind(this));
    }

});

L.Map.addInitHook('addHandler', 'smoothWheelZoom', L.Map.SmoothWheelZoom );


//・・・・・・・・・・・・SmoothWheelZoom・・・・・・・・・・・・・//

//・・・・・・・・・・・・ページ移動　ポップアップ・・・・・・・・・・・・・//

class CustomPopup {
    constructor() {
        this.overlay = null;
    }

    show(url) {
        this.createOverlay();
        this.createPopup(url);
        document.body.appendChild(this.overlay);
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            padding: 20px; /* 左右の余白を追加 */
            box-sizing: border-box; /* パディングを幅に含める */
        `;

        this.overlay.onclick = (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        };
    }

    createPopup(url) {
        const popup = document.createElement('div');
        popup.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            max-width: 400px;
            width: 100%; /* 幅を100%に設定 */
            text-align: center;
            box-sizing: border-box; /* パディングを幅に含める */
        `;

        popup.innerHTML = `
            <h2 style="margin: 0 0 20px; color: #333; font-size: 24px;">新しいページへ移動</h2>
            <p style="margin: 0 0 25px; color: #666; font-size: 16px;">新しいページに移動しますか？</p>
            <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;"> <!-- flex-wrap を追加 -->
                <button id="okButton" style="padding: 10px 20px; font-size: 16px; cursor: pointer; border: none; border-radius: 5px; background-color: #4CAF50; color: white; margin: 5px;">OK</button>
                <button id="cancelButton" style="padding: 10px 20px; font-size: 16px; cursor: pointer; border: none; border-radius: 5px; background-color: #f44336; color: white; margin: 5px;">キャンセル</button>
            </div>
        `;

        const okButton = popup.querySelector('#okButton');
        okButton.onclick = () => {
            window.location.href = url;
            this.close();
        };

        const cancelButton = popup.querySelector('#cancelButton');
        cancelButton.onclick = () => this.close();

        this.overlay.appendChild(popup);
    }

    close() {
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
    }
}

// グローバルに利用可能にする
window.CustomPopup = CustomPopup;
//・・・・・・・・・・・・ページ移動　ポップアップ・・・・・・・・・・・・・//

