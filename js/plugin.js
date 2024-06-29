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

        // Create popup window container
        this._wrapper = L.DomUtil.create('div',modality+' leaflet-control-window-wrapper', L.DomUtil.get(this.options.element));

        this._container = L.DomUtil.create('div', 'leaflet-control leaflet-control-window '+this.options.className,this._wrapper);
        this._container.setAttribute('style','max-width:'+this.options.maxWidth+'px');

        this._containerTitleBar = L.DomUtil.create('div', 'titlebar',this._container);
        this.titleContent = L.DomUtil.create('h2', 'title',this._containerTitleBar);
        this._containerContent =  L.DomUtil.create('div', 'content' ,this._container);
        this._containerPromptButtons =  L.DomUtil.create('div', 'promptButtons' ,this._container);

        if (this.options.closeButton) {
            this._closeButton = L.DomUtil.create('a', 'close',this._containerTitleBar);
            this._closeButton.innerHTML = '&times;';
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


//・・・・・・・・・・・・leaflet toolbar・・・・・・・・・・・・・//

!function(t,o,i){"use strict";t.L.Toolbar2=(L.Layer||L.Class).extend({statics:{baseClass:"leaflet-toolbar"},options:{className:"",filter:function(){return!0},actions:[]},initialize:function(t){L.setOptions(this,t),this._toolbar_type=this.constructor._toolbar_class_id},addTo:function(t){return this._arguments=[].slice.call(arguments),t.addLayer(this),this},onAdd:function(t){var o=t._toolbars[this._toolbar_type];0===this._calculateDepth()&&(o&&t.removeLayer(o),t._toolbars[this._toolbar_type]=this)},onRemove:function(t){0===this._calculateDepth()&&delete t._toolbars[this._toolbar_type]},appendToContainer:function(t){var o,i,e,n,s=this.constructor.baseClass+"-"+this._calculateDepth()+" "+this.options.className;for(this._container=t,this._ul=L.DomUtil.create("ul",s,t),this._disabledEvents=["click","mousemove","dblclick","mousedown","mouseup","touchstart"],i=0,n=this._disabledEvents.length;i<n;i++)L.DomEvent.on(this._ul,this._disabledEvents[i],L.DomEvent.stopPropagation);for(o=0,e=this.options.actions.length;o<e;o++)(new(this._getActionConstructor(this.options.actions[o])))._createIcon(this,this._ul,this._arguments)},_getActionConstructor:function(t){var o=this._arguments,i=this;return t.extend({initialize:function(){t.prototype.initialize.apply(this,o)},enable:function(o){i._active&&i._active.disable(),i._active=this,t.prototype.enable.call(this,o)}})},_hide:function(){this._ul.style.display="none"},_show:function(){this._ul.style.display="block"},_calculateDepth:function(){for(var t=0,o=this.parentToolbar;o;)t+=1,o=o.parentToolbar;return t}}),L.Evented||L.Toolbar2.include(L.Mixin.Events),L.toolbar={};var e=0;L.Toolbar2.extend=function(t){var o=L.extend({},t.statics,{_toolbar_class_id:e});return e+=1,L.extend(t,{statics:o}),L.Class.extend.call(this,t)},L.Map.addInitHook(function(){this._toolbars={}}),L.Toolbar2.Action=L.Handler.extend({statics:{baseClass:"leaflet-toolbar-icon"},options:{toolbarIcon:{html:"",className:"",tooltip:""},subToolbar:new L.Toolbar2},initialize:function(t){var o=L.Toolbar2.Action.prototype.options.toolbarIcon;L.setOptions(this,t),this.options.toolbarIcon=L.extend({},o,this.options.toolbarIcon)},enable:function(t){t&&L.DomEvent.preventDefault(t),this._enabled||(this._enabled=!0,this.addHooks&&this.addHooks())},disable:function(){this._enabled&&(this._enabled=!1,this.removeHooks&&this.removeHooks())},_createIcon:function(t,o,i){var e=this.options.toolbarIcon;this.toolbar=t,this._icon=L.DomUtil.create("li","",o),this._link=L.DomUtil.create("a","",this._icon),this._link.innerHTML=e.html,this._link.setAttribute("href","#"),this._link.setAttribute("title",e.tooltip),L.DomUtil.addClass(this._link,this.constructor.baseClass),e.className&&L.DomUtil.addClass(this._link,e.className),L.DomEvent.on(this._link,"click",this.enable,this),this._addSubToolbar(t,this._icon,i)},_addSubToolbar:function(t,o,i){var e=this.options.subToolbar,n=this.addHooks,s=this.removeHooks;e.parentToolbar=t,e.options.actions.length>0&&((i=[].slice.call(i)).push(this),e.addTo.apply(e,i),e.appendToContainer(o),this.addHooks=function(t){"function"==typeof n&&n.call(this,t),e._show()},this.removeHooks=function(t){"function"==typeof s&&s.call(this,t),e._hide()})}}),L.toolbarAction=function(t){return new L.Toolbar2.Action(t)},L.Toolbar2.Action.extendOptions=function(t){return this.extend({options:t})},L.Toolbar2.Control=L.Toolbar2.extend({statics:{baseClass:"leaflet-control-toolbar "+L.Toolbar2.baseClass},initialize:function(t){L.Toolbar2.prototype.initialize.call(this,t),this._control=new L.Control.Toolbar(this.options)},onAdd:function(t){this._control.addTo(t),L.Toolbar2.prototype.onAdd.call(this,t),this.appendToContainer(this._control.getContainer())},onRemove:function(t){L.Toolbar2.prototype.onRemove.call(this,t),this._control.remove?this._control.remove():this._control.removeFrom(t)}}),L.Control.Toolbar=L.Control.extend({onAdd:function(){return L.DomUtil.create("div","")}}),L.toolbar.control=function(t){return new L.Toolbar2.Control(t)},L.Toolbar2.Popup=L.Toolbar2.extend({statics:{baseClass:"leaflet-popup-toolbar "+L.Toolbar2.baseClass},options:{anchor:[0,0]},initialize:function(t,o){L.Toolbar2.prototype.initialize.call(this,o),this._marker=new L.Marker(t,{icon:new L.DivIcon({className:this.options.className,iconAnchor:[0,0]})})},onAdd:function(t){this._map=t,this._marker.addTo(t),L.Toolbar2.prototype.onAdd.call(this,t),this.appendToContainer(this._marker._icon),this._setStyles()},onRemove:function(t){t.removeLayer(this._marker),L.Toolbar2.prototype.onRemove.call(this,t),delete this._map},setLatLng:function(t){return this._marker.setLatLng(t),this},_setStyles:function(){for(var t,o,i,e=this._container,n=this._ul,s=L.point(this.options.anchor),a=n.querySelectorAll(".leaflet-toolbar-icon"),l=[],r=0,c=0,h=a.length;c<h;c++)a[c].parentNode.parentNode===n&&(l.push(parseInt(L.DomUtil.getStyle(a[c],"height"),10)),r+=Math.ceil(parseFloat(L.DomUtil.getStyle(a[c],"width"))),r+=Math.ceil(parseFloat(L.DomUtil.getStyle(a[c],"border-right-width"))));n.style.width=r+"px",this._tipContainer=L.DomUtil.create("div","leaflet-toolbar-tip-container",e),this._tipContainer.style.width=r+Math.ceil(parseFloat(L.DomUtil.getStyle(n,"border-left-width")))+"px",this._tip=L.DomUtil.create("div","leaflet-toolbar-tip",this._tipContainer),t=Math.max.apply(void 0,l),n.style.height=t+"px",o=parseInt(L.DomUtil.getStyle(this._tip,"width"),10),i=new L.Point(r/2,t+1.414*o),e.style.marginLeft=s.x-i.x+"px",e.style.marginTop=s.y-i.y+"px"}}),L.toolbar.popup=function(t){return new L.Toolbar2.Popup(t)}}(window,document);

//・・・・・・・・・・・・leaflet toolbar・・・・・・・・・・・・・//


