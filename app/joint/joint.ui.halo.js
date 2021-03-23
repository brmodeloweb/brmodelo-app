import $ from "jquery";
import _ from "underscore";
import "backbone";
import * as joint from "jointjs";

joint.ui.Halo = Backbone.View.extend({
    PIE_INNER_RADIUS: 20,
    PIE_OUTER_RADIUS: 50,
    className: "halo",
    events: {
        "mousedown .handle": "onHandlePointerDown",
        "touchstart .handle": "onHandlePointerDown",
        "mousedown .pie-toggle": "onPieTogglePointerDown",
        "touchstart .pie-toggle": "onPieTogglePointerDown"
    },
    options: {
        tinyThreshold: 40,
        smallThreshold: 80,
        loopLinkPreferredSide: "top",
        loopLinkWidth: 40,
        rotateAngleGrid: 15,
        clearAll: !0,
        useModelGeometry: !1,
        boxContent: function(a, b) {
            var c = _.template("x: <%= x %>, y: <%= y %>, width: <%= width %>, height: <%= height %>, angle: <%= angle %>"),
                d = a.model.getBBox();
            return c({
                x: Math.floor(d.x),
                y: Math.floor(d.y),
                width: d.width,
                height: d.height,
                angle: Math.floor(a.model.get("angle") || 0)
            })
        },
        clone: function(a, b) {
            return a.clone().unset("z")
        },
        handles: [{
            name: "resize",
            position: "se",
            events: {
                pointerdown: "startResizing",
                pointermove: "doResize",
                pointerup: "stopBatch"
            },
            icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2RpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo2NjREODhDMjc4MkVFMjExODUyOEU5NTNCRjg5OEI3QiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDowQTc4MzUwQjJGMEIxMUUyOTFFNUE1RTAwQ0EwMjU5NyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowQTc4MzUwQTJGMEIxMUUyOTFFNUE1RTAwQ0EwMjU5NyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IFdpbmRvd3MiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo2NjREODhDMjc4MkVFMjExODUyOEU5NTNCRjg5OEI3QiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo2NjREODhDMjc4MkVFMjExODUyOEU5NTNCRjg5OEI3QiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pk3oY88AAAEMSURBVHja7JftDYMgEIbRdABHcARG6CalGziCG3QE3KAj0A0cod3AEa6YUEMpcKeI9oeXvP5QuCeA90EBAGwPK7SU1hkZ12ldiT6F1oUycARDRHLBgiTiEzCwTNhNuRT8XOEog/AyMqlOXPEuZzx7q29aXGtIhLvQwfNuAgtrYgrcB+VWqH2BhceBD45ZE4EyB/7zIQTvCeAWgdpw1CqT2Sri2LsRZ4cddtg/GLfislo55oNZxE2ZLcFXT8haU7YED9yXpxsCGMvTn4Uqe7DIXJnsAqGYB5CjFnNT6yEE3qr7iIJT+60YXJUZQ3G8ALyof+JWfTV6xrluEuqkHw/ESW3CoJsBRVubtwADAI2b6h9uJAFqAAAAAElFTkSuQmCC"
        }, {
            name: "remove",
            position: "nw",
            events: {
                pointerdown: "removeElement"
            },
            icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAO5JREFUeNrUV9sNwyAMtLoAI3SEjJIRMgqjdBRG8CiMQGnlVHwEOBAE19L9OdwRGz+IcNsibISLCBk48dlooB0RXCDNgeXbbntWbovCyVlNtkf4AeQnvJwJ//IwCQdy8zAZeynm/gYBPpcT7gbyNDGb4/4CnyOLb1M+MED+MVPxZfEhQASnFQ4hp4qIlJxAEd+KaQGlpiIC8bmCRZOvRNBL/kvGltp+RdRLfqK5wZhCITMdjaury5lB5OFBCuxvQjAtCZc/w+WFaHkpXt6MVLTj5QOJipFs+VCqYixXsZioWM1GLaf7yK45ZT1/CzAAESidXQn9F/MAAAAASUVORK5CYII="
        }, {
            name: "clone",
            position: "n",
            events: {
                pointerdown: "startCloning",
                pointermove: "doClone",
                pointerup: "stopCloning"
            },
            icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2RpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo2NjREODhDMjc4MkVFMjExODUyOEU5NTNCRjg5OEI3QiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoxNTM0NjJBRjJGMkQxMUUyQkRFM0FCRTMxMDhFQkE2QiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxNTM0NjJBRTJGMkQxMUUyQkRFM0FCRTMxMDhFQkE2QiIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IFdpbmRvd3MiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo2NjREODhDMjc4MkVFMjExODUyOEU5NTNCRjg5OEI3QiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo2NjREODhDMjc4MkVFMjExODUyOEU5NTNCRjg5OEI3QiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PkJFWv4AAAD3SURBVHja5FfRDYMgED2bDsAIjsAIMAluoqs4CY7gCI7ABtTTnsEUNCVQanzJGT/Qx7t7HFBZa6EEHlAIxYh90HPYzCHul+pixM93TV1wfDRNA0qppGRSyh2x8A2q6xqEEIc/mqZpCcTZWJ/iaPR9D13XLe/fNqKiNd6lahxHMMb8jlhrvRlgGAbvYJwQTsytMcH9hjEGnPN0NUZS15khx2L2SMi1GwgqQfdSkKPJ1RRnau/ZMq9J3LbtVtfodezrw6H1nAp2NeWK2bm5Tx9lTyAfilNhXuOkTv/n7hTqwbFwN5DDVGcMHVIsM2fVu7lXt7s7vQQYAIMHB7xhVbHdAAAAAElFTkSuQmCC"
        }, {
            name: "link",
            position: "e",
            events: {
                pointerdown: "startLinking",
                pointermove: "doLink",
                pointerup: "stopLinking"
            },
            icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjIwRkVFNkM3MkU3RjExRTJBMDA3RkZBQzMyMzExQzIzIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjIwRkVFNkM4MkU3RjExRTJBMDA3RkZBQzMyMzExQzIzIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MjBGRUU2QzUyRTdGMTFFMkEwMDdGRkFDMzIzMTFDMjMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MjBGRUU2QzYyRTdGMTFFMkEwMDdGRkFDMzIzMTFDMjMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5hjT/5AAAA8ElEQVR42syXwQ3DIAxFUbtAR+gIHLsSN2+SboA6CSOEMbghJqCAHKlNmwYwkWvpKwdinmRsY4Sos2sSJJkknxRX8rgG+C/ZJG4YG2XQt9kuSVMHcK0J96qGzgOgi+Ya+GhoFfwo6C5890wBIGqto5SScuYf2fvTKcMW895T4G/ZblrARLh5bQ5VTjnMg+ClyUCL0yA4iJ7ONABewu17koQIz8z+2iTCaY3hG7zG7yQYjS3UbMnFVk5sDYStZbJdEizX4hnBDqeD21bNOedECKF8lVLCWttTuvekx9+MPmzDHut4yzrQsz5hDn+0PQUYAOGQcmTsT0IpAAAAAElFTkSuQmCC"
        }, {
            name: "fork",
            position: "ne",
            events: {
                pointerdown: "startForking",
                pointermove: "doFork",
                pointerup: "stopForking"
            },
            icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QUUEAUZcNUVHAAAALtJREFUWMPtlt0RgjAMgL9zAkZglI7ACLoJm8RNHIERGMER6ksfsIeRtsGq9LvLW2i+oz8JNBoHYAZcTQEfQoCupoAH7sBZS1jGDAwbCgwh1yfEDejfCSx/3SsksXAcIxsTZYfiSQJrEiUCT1sQ45TFNQkJ33aphzB1f9ckZK9rKBkHM2YqfYgsJIr5aYnJshfkSJj3Ak3C5fQCSwmTh+hTEh4YTwUCF+D6DRNPcTuuPpD8/UhWfShtNFQe+d/oVK9MAB0AAAAASUVORK5CYII="
        }, {
            name: "unlink",
            position: "w",
            events: {
                pointerdown: "unlinkElement"
            },
            icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjJCNjcxNUZBMkU3RjExRTI5RURCRDA5NDlGRDBFMDgwIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjJCNjcxNUZCMkU3RjExRTI5RURCRDA5NDlGRDBFMDgwIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MkI2NzE1RjgyRTdGMTFFMjlFREJEMDk0OUZEMEUwODAiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MkI2NzE1RjkyRTdGMTFFMjlFREJEMDk0OUZEMEUwODAiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5htS6kAAABHElEQVR42uxW0Q2DIBBV0wEcwRHsBo7QERjBbkAnYARGaDdghI5gN9ANKCRHQy4HxFakH77kxeTAe95xd1JrrasSaKpCOIR3R2+oDLXHp+GQU3RAYhyezsZyCU8gwJGdgX3+wXcHfi1HyOwHGsQpuMjXprwFMU3QavGTtzHkwGJZIXoxFBBtyOer8opKog0ykQ0qrSoQpTsy7gfZg9EtKu/cnbBvm4iC454PijKUgQ4WYy9rot0Y6gBMhQvKoY70dYs+TERqAcOe4dXwsUXbWdF7IgsztM3/jsziqd69uLZqp/GbdgoNEJF7gMR+BC7KfuXInBIfwJrELF4Ss5yCLaiz4S3isyv6W8QXAbHXRaDI1ac+LvSHcC68BRgAHv/CnODh8mEAAAAASUVORK5CYII="
        }, {
            name: "rotate",
            position: "sw",
            events: {
                pointerdown: "startRotating",
                pointermove: "doRotate",
                pointerup: "stopBatch"
            },
            icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjI1NTk5RUFBMkU3RjExRTI4OUIyQzYwMkMyN0MxMDE3IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjI1NTk5RUFCMkU3RjExRTI4OUIyQzYwMkMyN0MxMDE3Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MjU1OTlFQTgyRTdGMTFFMjg5QjJDNjAyQzI3QzEwMTciIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MjU1OTlFQTkyRTdGMTFFMjg5QjJDNjAyQzI3QzEwMTciLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6W+5aDAAABJElEQVR42syXbRGDMAyGYTcBOBgSkICESWAOmAMcTAJzgAQksCnYHFRC13Jlx7qkDf0Acvf+6ZF7mjRNQ8o5T/ZqmVAt1AkxIa5JrvXqmywUsAVANkmf3BV6RqKjSvpWlqD+7OYBhKKHoMNS6EuddaPUqjUqfIJyPb2Ysyye0pC6Qm0I8680KJ/vhDmcFbU2mAb9glvk48KhMAtiYY7RYunxuRVWcI2cqa/ZegBYFGWA5jPYwAy4MrGhI1hf6FaA8gPg/PSA9tSbcAz8il2XOIRM9SILXVxki3GdEvUmD6bhIHYDQeFrtEwUvsYj0WBRx34Wc5cXJcQg8GMpMPrUBsBb6DHrbie1IdNUeRe6UNLVRB72Nh1v9zfQR/+FSbf6afsIMAB0elCwFZfPigAAAABJRU5ErkJggg=="
        }],
        type: "surrounding",
        pieSliceAngle: 45,
        pieStartAngleOffset: 0,
        pieIconSize: 14,
        linkAttributes: {},
        smoothLinks: void 0
    },
    initialize: function(a) {
        this.options = _.extend({}, _.result(this, "options"), a || {}), _.defaults(this.options, {
            paper: this.options.cellView.paper,
            graph: this.options.cellView.paper.model
        }), _.bindAll(this, "pointermove", "pointerup", "render", "update", "remove"), 
        joint.ui.Halo.clear(this.options.paper), 
        this.listenTo(this.options.graph, "reset", this.remove), 
        this.listenTo(this.options.graph, "all", this.update), 
        this.listenTo(this.options.paper, "blank:pointerdown halo:create", this.remove), 
        this.listenTo(this.options.paper, "scale translate", this.update), 
        this.listenTo(this.options.cellView.model, "remove", this.remove), 
        $(document.body).on("mousemove touchmove", this.pointermove), 
        $(document).on("mouseup touchend", this.pointerup), 
        this.options.paper.$el.append(this.$el),
        this.handles = [], _.each(this.options.handles, this.addHandle, this)
    },
    render: function() {
        var a = this.options;
        switch (this.$el.empty(), this.$handles = $("<div/>").addClass("handles").appendTo(this.el), this.$box = $("<label/>").addClass("box").appendTo(this.el), this.$el.addClass(a.type), this.$el.attr("data-type", a.cellView.model.get("type")), this.$handles.append(_.map(this.handles, this.renderHandle, this)), a.type) {
            case "toolbar":
            case "surrounding":
                this.hasHandle("fork") && this.toggleFork();
                break;
            case "pie":
                this.$pieToggle = $("<div/>").addClass("pie-toggle").appendTo(this.el);
                break;
            default:
                throw new Error("ui.Halo: unknown type")
        }
        return this.update(), this.$el.addClass("animate").appendTo(a.paper.el), this
    },
    update: function() {
        var a = this.options.cellView;
        if (!(a.model instanceof joint.dia.Link)) {
            this.updateBoxContent();
            var b = a.getBBox({
                useModelGeometry: this.options.useModelGeometry
            });
            this.$el.toggleClass("tiny", b.width < this.options.tinyThreshold && b.height < this.options.tinyThreshold), this.$el.toggleClass("small", !this.$el.hasClass("tiny") && b.width < this.options.smallThreshold && b.height < this.options.smallThreshold), this.$el.css({
                width: b.width,
                height: b.height,
                left: b.x,
                top: b.y
            }), this.hasHandle("unlink") && this.toggleUnlink()
        }
    },
    updateBoxContent: function() {
        if (this.$box) {
            var a = this.options.boxContent,
                b = this.options.cellView;
            if (_.isFunction(a)) {
                var c = a.call(this, b, this.$box[0]);
                c && this.$box.html(c)
            } else a ? this.$box.html(a) : this.$box.remove()
        }
    },
    addHandle: function(a) {
        var b = this.getHandle(a.name);
        if (!b && (this.handles.push(a), _.each(a.events, function(b, c) {
                _.isString(b) ? this.on("action:" + a.name + ":" + c, this[b], this) : this.on("action:" + a.name + ":" + c, b)
            }, this), this.$handles)) {
            this.renderHandle(a).appendTo(this.$handles)
        }
        return this
    },
    renderHandle: function(a) {
        var b = this.getHandleIdx(a.name),
            c = $("<div/>").addClass("handle").addClass(a.name).attr("data-action", a.name).prop("draggable", !1);
        switch (this.options.type) {
            case "toolbar":
            case "surrounding":
                c.addClass(a.position), a.content && c.html(a.content);
                break;
            case "pie":
                var d = this.PIE_OUTER_RADIUS,
                    e = this.PIE_INNER_RADIUS,
                    f = (d + e) / 2,
                    h = joint.g.point(d, d),
                    i = joint.g.toRad(this.options.pieSliceAngle),
                    j = b * i + joint.g.toRad(this.options.pieStartAngleOffset),
                    k = j + i,
                    l = V.createSlicePathData(e, d, j, k),
                    m = V("svg").addClass("slice-svg"),
                    n = V("path").attr("d", l).addClass("slice"),
                    o = joint.g.point.fromPolar(f, -j - i / 2, h),
                    p = this.options.pieIconSize,
                    q = V("image").attr(o).addClass("slice-icon");
                q.attr({
                    width: p,
                    height: p
                }), q.translate(-p / 2, -p / 2), m.append([n, q]), c.append(m.node)
        }
        return a.icon && this.setHandleIcon(c, a.icon), joint.util.setAttributesBySelector(c, a.attrs), c
    },
    setHandleIcon: function(a, b) {
        switch (this.options.type) {
            case "pie":
                var c = a.find(".slice-icon");
                V(c[0]).attr("xlink:href", b);
                break;
            case "toolbar":
            case "surrounding":
                a.css("background-image", "url(" + b + ")")
        }
    },
    removeHandle: function(a) {
        var b = this.getHandleIdx(a),
            c = this.handles[b];
        return c && (_.each(c.events, function(b, c) {
            this.off("action:" + a + ":" + c)
        }, this), this.$(".handle." + a).remove(), this.handles.splice(b, 1)), this
    },
    changeHandle: function(a, b) {
        var c = this.getHandle(a);
        return c && (this.removeHandle(a), this.addHandle(_.merge({
            name: a
        }, c, b))), this
    },
    hasHandle: function(a) {
        return -1 !== this.getHandleIdx(a)
    },
    getHandleIdx: function(a) {
        return _.findIndex(this.handles, {
            name: a
        })
    },
    getHandle: function(a) {
        return _.findWhere(this.handles, {
            name: a
        })
    },
    toggleHandle: function(a, b) {
        var c = this.getHandle(a);
        if (c) {
            var d = this.$(".handle." + a);
            _.isUndefined(b) && (b = !d.hasClass("selected")), d.toggleClass("selected", b);
            var e = b ? c.iconSelected : c.icon;
            e && this.setHandleIcon(d, e)
        }
        return this
    },
    selectHandle: function(a) {
        return this.toggleHandle(a, !0)
    },
    deselectHandle: function(a) {
        return this.toggleHandle(a, !1)
    },
    deselectAllHandles: function() {
        return _.chain(this.handles).pluck("name").each(this.deselectHandle, this).value(), this
    },
    onHandlePointerDown: function(a) {
        this._action = $(a.target).closest(".handle").attr("data-action"), this._action && (a.preventDefault(), a.stopPropagation(), a = joint.util.normalizeEvent(a), this._clientX = a.clientX, this._clientY = a.clientY, this._startClientX = this._clientX, this._startClientY = this._clientY, this.triggerAction(this._action, "pointerdown", a))
    },
    onPieTogglePointerDown: function(a) {
        a.stopPropagation(), this.toggleState()
    },
    triggerAction: function(a, b, c) {
        var d = Array.prototype.slice.call(arguments, 2);
        d.unshift("action:" + a + ":" + b), this.trigger.apply(this, d)
    },
    startCloning: function(a) {
        var b = this.options;
        b.graph.trigger("batch:start");
        var c = b.clone(b.cellView.model, {
            clone: !0
        });
        if (!(c instanceof joint.dia.Cell)) throw new Error('ui.Halo: option "clone" has to return a cell.');
        c.addTo(b.graph, {
            halo: this.cid
        }), this._cloneView = c.findView(b.paper), this._cloneView.pointerdown(a, this._clientX, this._clientY)
    },
    startLinking: function(a) {
        this.options.graph.trigger("batch:start");
        var b = this.options.cellView,
            c = $.data(a.target, "selector"),
            d = this.options.paper.getDefaultLink(b, c && b.el.querySelector(c));
        d.set("source", {
            id: b.model.id,
            selector: c
        }), d.set("target", {
            x: a.clientX,
            y: a.clientY
        }), d.attr(this.options.linkAttributes), _.isBoolean(this.options.smoothLinks) && d.set("smooth", this.options.smoothLinks), this.options.graph.addCell(d, {
            validation: !1,
            halo: this.cid
        }), d.set("target", this.options.paper.snapToGrid({
            x: a.clientX,
            y: a.clientY
        })), this._linkView = this.options.paper.findViewByModel(d), this._linkView.startArrowheadMove("target")
    },
    startForking: function(a) {
        var b = this.options;
        b.graph.trigger("batch:start");
        var c = b.clone(b.cellView.model, {
            fork: !0
        });
        if (!(c instanceof joint.dia.Cell)) throw new Error('ui.Halo: option "clone" has to return a cell.');
        var d = b.paper.getDefaultLink(b.cellView).set({
            source: {
                id: b.cellView.model.id
            },
            target: {
                id: c.id
            }
        });
        d.attr(b.linkAttributes), _.isBoolean(b.smoothLinks) && d.set("smooth", b.smoothLinks), b.graph.addCells([c, d], {
            halo: this.cid
        }), this._cloneView = c.findView(b.paper), this._cloneView.pointerdown(a, this._clientX, this._clientY)
    },
    startResizing: function(a) {
        this.options.graph.trigger("batch:start"), this._flip = [1, 0, 0, 1, 1, 0, 0, 1][Math.floor(joint.g.normalizeAngle(this.options.cellView.model.get("angle")) / 45)]
    },
    startRotating: function(a) {
        this.options.graph.trigger("batch:start");
        var b = this.options.cellView.model.getBBox().center(),
            c = joint.g.normalizeAngle(this.options.cellView.model.get("angle")),
            d = this.options.paper.snapToGrid({
                x: a.clientX,
                y: a.clientY
            });
        this._center = b, this._rotationStartAngle = c || 0, this._clientStartAngle = joint.g.point(d).theta(b)
    },
    doResize: function(a, b, c) {
        var d = this.options.cellView.model.get("size"),
            e = Math.max(d.width + (this._flip ? b : c), 1),
            f = Math.max(d.height + (this._flip ? c : b), 1);
        this.options.cellView.model.resize(e, f, {
            absolute: !0
        })
    },
    doRotate: function(a) {
        var b = this.options.paper.snapToGrid({
                x: a.clientX,
                y: a.clientY
            }),
            c = this._clientStartAngle - joint.g.point(b).theta(this._center),
            d = joint.g.snapToGrid(this._rotationStartAngle + c, this.options.rotateAngleGrid);
        this.options.cellView.model.rotate(d, !0)
    },
    doClone: function(a) {
        this._cloneView.pointermove(a, this._clientX, this._clientY)
    },
    doFork: function(a) {
        this._cloneView.pointermove(a, this._clientX, this._clientY)
    },
    doLink: function(a) {
        var b = this.options.paper.snapToGrid({
            x: a.clientX,
            y: a.clientY
        });
        this._linkView.pointermove(a, b.x, b.y)
    },
    stopLinking: function(a) {
        var b = this._linkView,
            c = b.model;
        b.pointerup(a), c.hasLoop() && this.makeLoopLink(c), this.options.paper.options.linkPinning || _.has(c.get("target"), "id") ? (this.stopBatch(), this.triggerAction("link", "add", c)) : (c.remove({
            ui: !0
        }), this.stopBatch()), delete this._linkView
    },
    stopForking: function(a) {
        this._cloneView.pointerup(a, this._clientX, this._clientY), this.stopBatch()
    },
    stopCloning: function(a) {
        this._cloneView.pointerup(a, this._clientX, this._clientY), this.stopBatch()
    },
    pointermove: function(a) {
        if (this._action) {
            a.preventDefault(), a.stopPropagation(), a = joint.util.normalizeEvent(a);
            var b = this.options.paper.snapToGrid({
                    x: a.clientX,
                    y: a.clientY
                }),
                c = this.options.paper.snapToGrid({
                    x: this._clientX,
                    y: this._clientY
                }),
                d = b.x - c.x,
                e = b.y - c.y;
            this.triggerAction(this._action, "pointermove", a, d, e, a.clientX - this._startClientX, a.clientY - this._startClientY), this._clientX = a.clientX, this._clientY = a.clientY
        }
    },
    pointerup: function(a) {
        this._action && (this.triggerAction(this._action, "pointerup", a), delete this._action)
    },
    stopBatch: function() {
        this.options.graph.trigger("batch:stop")
    },
    remove: function(a) {
        Backbone.View.prototype.remove.apply(this, arguments), $(document.body).off("mousemove touchmove", this.pointermove), $(document).off("mouseup touchend", this.pointerup)
    },
    removeElement: function(a) {
        this.options.cellView.model.remove()
    },
    unlinkElement: function(a) {
        this.options.graph.removeLinks(this.options.cellView.model)
    },
    toggleUnlink: function() {
        var a = this.options.graph.getConnectedLinks(this.options.cellView.model).length > 0;
        this.$handles.children(".unlink").toggleClass("hidden", !a)
    },
    toggleFork: function() {
        var a = this.options.cellView.model.clone(),
            b = this.options.paper.createViewForModel(a),
            c = this.options.paper.options.validateConnection(this.options.cellView, null, b, null, "target");
        this.$handles.children(".fork").toggleClass("hidden", !c), b.remove(), a = null
    },
    toggleState: function() {
        var a = this.$el;
        this.isOpen() ? (a.removeClass("open"), this.trigger("state:close")) : (a.addClass("open"), this.trigger("state:open"))
    },
    isOpen: function() {
        return this.$el.hasClass("open")
    },
    makeLoopLink: function(a) {
        var b, c, d = this.options.loopLinkWidth,
            e = this.options.paper.options,
            f = joint.g.rect({
                x: 0,
                y: 0,
                width: e.width,
                height: e.height
            }),
            h = V(this.options.cellView.el).bbox(!1, this.options.paper.viewport),
            i = _.uniq([this.options.loopLinkPreferredSide, "top", "bottom", "left", "right"]),
            j = _.find(i, function(a) {
                var e, i = 0,
                    j = 0;
                switch (a) {
                    case "top":
                        e = joint.g.point(h.x + h.width / 2, h.y - d), i = d / 2;
                        break;
                    case "bottom":
                        e = joint.g.point(h.x + h.width / 2, h.y + h.height + d), i = d / 2;
                        break;
                    case "left":
                        e = joint.g.point(h.x - d, h.y + h.height / 2), j = d / 2;
                        break;
                    case "right":
                        e = joint.g.point(h.x + h.width + d, h.y + h.height / 2), j = d / 2
                }
                return b = joint.g.point(e).offset(-i, -j), c = joint.g.point(e).offset(i, j), f.containsPoint(b) && f.containsPoint(c)
            }, this);
        j && a.set("vertices", [b, c])
    }
}, {
    clear: function(a) {
        a.trigger("halo:create")
    }
});