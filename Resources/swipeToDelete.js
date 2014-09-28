exports.emulateRowSwipeEvents = function (table, SENSITIVITY) {
    var SENSITIVITY = SENSITIVITY ?  SENSITIVITY : 10;
    var start;
    function touchStart(e) {
        Ti.API.debug("touchstart");
        start = e;
    }
    function touchEnd(end) {
        Ti.API.debug("touchend");
        end.direction = rowSwipeDirection(end);
        start = null; //release
        end.direction && end.source.fireEvent('rowswipe', end);
    }
    table.addEventListener('touchstart', touchStart);
    table.addEventListener('touchend', touchEnd);

    function rowSwipeDirection(end) {
        if (!start) {
            Ti.API.warn("no start?? that should not happen..");
            return;
        }
        if (!end.row) {
            Ti.API.info("does not end on a row");
            return;
        }
        if (start.index !== end.index) {
            Ti.API.info("that is scrolling??");
            return;
        }
        // 'x' field is missing when swiping on TableViewRow
        // => require a child the fully fills the row (either a view or also a label);
        var dx = end.x - start.x;
        if (Math.abs(dx)<SENSITIVITY) {
            Ti.API.info("not enough movement for a swipe");
            return;
        }
        Ti.API.info("this is a valid swipe!");
        return dx<0 ? "left" : "right";
    }
};

exports.emulateRowDeleteEvents = function (table, forceIOS) {
    // popup seems to work stable, while emulating iOS style has redraw/update issues..
    // => may the redraw problems are just a simulator thing
    // => currently resolving the problem with a hide/show of the entire table
    var MIMIC_IOS = true;
    var SENSITIVITY = 3;

    if (!forceIOS && Ti.Platform.name!=="android") {
        return; // only required on android, built-in for iOS
    }
    exports.emulateRowSwipeEvents(table, SENSITIVITY);

    function swipe(e) {
        Ti.API.debug("swipe in direction: "+e.direction);
        if (!e.row.editable) {
            Ti.API.debug("this row is not editable");
            return;
        }
        if (e.direction==='left') {
            Ti.API.info("delete swipe for row: " + e.index);
            var doDelete = function () {
                Ti.API.info("fire the actual delete event");
                table.deleteRow(e.index); //iOS directly deletes the row
                table.fireEvent("delete", e);
            };
            if (MIMIC_IOS) {
                createDeleteButtonAndSetRemover(e.row, doDelete);
            } else {
                popupConfirmation(doDelete);
            }
        }
    }
    table.addEventListener('rowswipe', swipe);

    function popupConfirmation(doDelete) {
        var d = Ti.UI.createAlertDialog({
            title:"delete this row?", //TODO: localization..
            buttonNames: ["yes", "no"], cancel:1
        });
        d.addEventListener("click", function(e) {
            if (e.index===0) {
                doDelete();
            }
        });
        d.show({modal:true});
    }

    function createDeleteButtonAndSetRemover(row, doDelete) {
        Ti.API.info("create delete button");
        //TODO: styling/localization...
        var txt = L('delete', 'löschen');
        var width = 100, fading = 300;
        var height = row.children.length===0 ?
            row.height : row.children[0].rect.height
        var btn = Ti.UI.createLabel({ id: "swipeDelete",
                text:txt, textAlign: "center",
                backgroundColor:"red", color:"white",
                right:0, width:1, height:height});
        var buttonRemover = function(e) {
            // avoid double execution (could still happen?)
            table.removeEventListener('touchstart', buttonRemover);
            // double check that btn & row still exist..
            // the row (and maybe the button) have been destroyed by a table update
            btn && btn.animate({width:0, duration:fading}, function() {
                row && row.remove(btn);
                row = btn = null;
                Ti.API.info("removed");
                if (e.source.id==='swipeDelete') {
                    doDelete();
                }
            });
        }
        table.addEventListener('touchstart', buttonRemover);
        row.add(btn);
        btn.animate({width:width, duration:fading}, function() {
            // the hide/show is a workaround to enforce screen redraw
            // - maybe not necessary on the actual device.
            // - any alternatives?
            table.hide(); table.show();
        });
    }
}
