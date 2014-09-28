// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

// create tab group
var tabGroup = Titanium.UI.createTabGroup();


//
// create base UI tab and root window
//
var win1 = Titanium.UI.createWindow({
    title:'Tab 1',
    backgroundColor:'#fff'
});
var tab1 = Titanium.UI.createTab({
    icon:'KS_nav_views.png',
    title:'Tab 1',
    window:win1
});


var table = Ti.UI.createTableView();
var rows = [];
for (i=0; i<10; i++) {
    var label1 = Titanium.UI.createLabel({
        color:'#999',
        text:'I am row '+i,
        textAlign:'left',
    });
    var row = Ti.UI.createTableViewRow({
        editable: true
    });
    row.add(label1);
    rows.push(row);
}
table.setData(rows);
table.addEventListener('delete', function(e) {
    var label = e.row.children[0];
    alert("you just deleted the "+e.index+"th row\n ["+label.text+"]");
});

win1.add(table);

//
// create controls tab and root window
//
var win2 = Titanium.UI.createWindow({
    title:'Tab 2',
    backgroundColor:'#fff'
});
var tab2 = Titanium.UI.createTab({
    icon:'KS_nav_ui.png',
    title:'Tab 2',
    window:win2
});

var label2 = Titanium.UI.createLabel({
	color:'#999',
	text:'I am Window 2',
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	width:'auto'
});

win2.add(label2);



//
//  add tabs
//
tabGroup.addTab(tab1);
tabGroup.addTab(tab2);


// open tab group
tabGroup.open();
