function dump_obj(obj, ind) {
    if (ind.length > 20) return ' ...\n';

    if (typeof obj == 'object') {
        var s = ind + '(object)\n';

        for (var i in obj) {
            try {
                s += ind + '        ' + i + ' -> ' + dump_obj(obj[i], '          ' + ind);
            } catch (e) {
                s += ind + '        ' + i + ' -> ' + '????\n';
            }
        }

        return s;
    } else if (typeof obj == 'array') {
        var s = ind + '(array)\n';

        for (var i=0; i<obj.length; i++) {
            try {
                s += ind + '        ' + i + ' -> ' + dump_obj(obj[i], '          ' + ind);
            } catch (e) {
                s += ind + '        ' + i + ' -> ' + '????\n';
            }
        }

        return s;
    } else {
        return ind + '(' + typeof obj + ') ' + obj + '\n';
    }
}


function doZoom() {
    var bounds = top.boundLayer.getDataExtent();

    if (bounds) top.osMap.setCenter(bounds.getCenterLonLat(), top.osMap.baseLayer.getZoomForExtent(bounds));
    else setTimeout('doZoom()', 100);
};


(function ($) {
    $(function() {
        $('#ispin_client_council').change(function() {
            $('#ispin_client_map').html('');
            
            var notation = $('option:selected', this).attr('notation');
            
            if (notation) {
                top.unitID = $('option:selected', this).attr('unitID');

                $.getJSON('ispin_client/' + notation, function(data) {
                    if (data) {
                        var osMap = new OpenSpace.Map('ispin_client_map');
                        var markers = osMap.getMarkerLayer();


                        var symbolizer = OpenLayers.Util.applyDefaults({ }, OpenLayers.Feature.Vector.style['default']);
                        var styleMap = new OpenLayers.StyleMap(symbolizer);

                        var lookup = {
                            'UTA': {
                                fillColor: 'white',
                                fillOpacity: 0.0,
                                strokeColor: 'magenta',
                                strokeWidth: 4,
                                strokeOpacity: 0.8
                            }
                        };

                        styleMap.addUniqueValueRules('default', 'AREA_CODE', lookup);

                        var boundLayer = new OpenSpace.Layer.Boundary('Boundaries',  { strategies: [new OpenSpace.Strategy.BBOX()], area_code: ['UTA'], admin_unit_ids: [top.unitID], styleMap: styleMap });


                        osMap.addLayer(boundLayer);


                        var bounds = new OpenLayers.Bounds();

                        bounds.extend(new OpenLayers.LonLat(data.min_e, data.min_n));
                        bounds.extend(new OpenLayers.LonLat(data.max_e, data.max_n));

                        osMap.setCenter(new OpenSpace.MapPoint((data.max_e + data.min_e) / 2, (data.max_n + data.min_n) / 2), osMap.baseLayer.getZoomForExtent(bounds));

                        if (typeof data.notices == 'undefined') {
                            top.osMap = osMap;
                            top.boundLayer = boundLayer;
                            
                            setTimeout('doZoom()', 100);
                        } else {
                            osMap.raiseLayer(markers, 1);

                            for (var i=0; i<data.notices.length; i++) osMap.createMarker(new OpenSpace.MapPoint(data.notices[i].e, data.notices[i].n), null, '<a href="' + data.notices[i].notice + '">Notice</a>', new OpenSpace.ScreenSize(150, 90));
                        }
                    }
                });
            } else {
                var osMap = new OpenSpace.Map('ispin_client_map');
                osMap.setCenter(new OpenSpace.MapPoint(300000, 800000), 1);
            }
        }).trigger('change');
    });
})(jQuery);
