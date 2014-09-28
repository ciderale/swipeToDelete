
describe("SwipeToDelete Module", function() {
    function createRow(label, rowProps) {
        var row = Ti.UI.createTableViewRow(rowProps);
        var view = Ti.UI.createView({height:100, width:"100%"});
        var label = Ti.UI.createLabel({text:label,width:100,height:100});
        view.add(label);
        row.add(view);
        return row;
    }

    beforeEach(function() {
        win = Ti.UI.createWindow({layout:'vertical'});
        table = Ti.UI.createTableView();
        row = createRow("Row A",
            {backgroundColor:"green", hasChild:true,selectionStyle:"None"});
        row2 = createRow("Row B",
            {backgroundColor:"blue", hasChild:false,selectionStyle:"None"});
        rows = [row,row2];
        table.setData(rows);
        win.add(table);
        win.open();
        assert.equal(2,table.data[0].rows.length, "initially two rows");
    })

    describe("RowSwipe Events", function() {
        //android: firing the event on the row doest not work (doest not bubble to parent)
        //is that a bug? or how should we fire the event?
        function fireEvent(type, args, index) {
            if (Ti.Platform.name==="android") {
                if (index>=0) {//assemble the necessary event data for android
                    args.row = rows[index];
                    args.index = index;
                }
                table.fireEvent(type, args);
            } else {
                if (index>=0) {
                    rows[index].children[0].fireEvent(type,args);
                } else {
                    table.fireEvent(type, args);
                }
            }
        };

        beforeEach(function() {
            rse = {};
            callback = function(evt) {
                 //copy all.. or build some other thing..
                 rse.dir = evt.direction;
                 rse.index = evt.index;
            };
            table.addEventListener('rowswipe', callback);
            require('swipeToDelete').emulateRowSwipeEvents(table);

            //cannot handle titanium proxy/wrapper objects...
            //callback = jasmine.createSpy('callback'); //register in setup
            //expect(callback).toHaveBeenCalled();
            //expect(callback).toHaveBeenCalledWith(jasmine.objectContaining({ direction:"asdf" }));
        })

        it("happy path works: right swipe on row 0", function(){
            fireEvent('touchstart', {x:3}, 0);
            fireEvent('touchend', {x:20}, 0);
            waits(100);
            runs(function(){
                expect(rse.dir).toEqual('right');
                expect(rse.index).toEqual(0);
            });
        })

        it("happy path works: left swipe on row 1", function(){
            fireEvent('touchstart', {x:30}, 1);
            fireEvent('touchend', {x:5}, 1);
            waits(100);
            runs(function(){
                expect(rse.dir).toEqual('left');
                expect(rse.index).toEqual(1);
            });
        })

        it("not enough movement => no swipe", function(){
            fireEvent('touchstart', {x:3}, 0);
            fireEvent('touchend', {x:5}, 0);
            waits(100);
            runs(function(){
                expect(rse).toEqual({});
            });
        })

        it("not ending on a row=>no swipe", function(){
            fireEvent('touchstart', {x:30}, 0);
            fireEvent('touchend', {x:5}, -1);
            waits(100);
            runs(function(){
                expect(rse).toEqual({});
            });
        })

        it("no swipe when start/end row are not the same (index)", function(){
            fireEvent('touchstart', {x:30}, 0);
            fireEvent('touchend', {x:5}, 1);
            waits(100);
            runs(function(){
                expect(rse).toEqual({});
            });
        })
    })

    describe("SwipeToDelete ", function() {
        beforeEach(function() {
            require('swipeToDelete').emulateRowDeleteEvents(table, true);
        });

        [0,1].forEach(function(theindex){
        it("a rowswipe opens delete button on row "+theindex, function() {
            var evt = {direction:"left", index:theindex, row:rows[theindex]};
            table.fireEvent('rowswipe', evt);
            waits(100);
            runs(function(){
                expect(rows[theindex].children[1].id).toEqual('swipeDelete', "swipped row has delete button");
                expect(rows[1-theindex].children.length).toEqual(1, "no delete button on other row");
            })
        });
        });

        it("touching the delete button removes the row", function() {
            var delEvt={};
            table.addEventListener('delete', function(e) { delEvt.data = e; });

            table.fireEvent('rowswipe', {direction:"left", index:0, row:row});
            waits(1000);
            runs(function(){
                if (Ti.Platform.name==="android") {
                    //android-test does not bubble up to table..
                    table.fireEvent('touchstart', {source:{id:'swipeDelete'}});
                } else {
                    rows[0].children[1].fireEvent('touchstart');
                }
            })

            waitsFor(function() {return delEvt.data!==undefined;}, "delete received", 5000);
            runs(function(){
                expect(delEvt.data.index).toEqual(0, "delete row index");
                expect(table.data[0].rows.length).toEqual(1, "remaining rows");
            });
        })

        it("touching anything, but the delete button removes the delete button", function() {
            table.fireEvent('rowswipe', {direction:"left", index:0, row:row});
            waits(1000);
            runs(function(){
                if (Ti.Platform.name==="android") {
                    //android-test does not bubble up to table..
                    table.fireEvent('touchstart', {source:{id:'somethingelse'}});
                } else {
                    var notThebutton = rows[0].children[0];
                    notThebutton.fireEvent('touchstart');
                }
            })
            waits(3000);
            runs(function(){
                expect(row.children.length).toEqual(1, "button is gone");
                expect(table.data[0].rows.length).toEqual(2, "still 2 rows");
            });
        })
    })

    afterEach(function() {
        waits(500);
        runs(function(){
            win.close();
        });
    })
})
