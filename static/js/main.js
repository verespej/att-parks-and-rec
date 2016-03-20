var myArray = [];

$(document).ready(function() {
    var url = "data/parks.json";
    $.ajax({
        type: 'GET',
        url: url,
        async: false,
        contentType: "application/json",
        dataType: 'json',
        success: function (data) {
            data.events.sort(function(first, second) {
                return first.dtstamp.localeCompare(second.dtstamp);
            });
            eventData = data.events;
            $.each(eventData, function(i, val) {
                var date = $.format.date(val.dtstamp, "MM/dd");
                var time = $.format.date(val.dtstart, "h:mm a");
            	console.log(val);
            	//$("#events").append("<div> hello </div>");
    			$("#events").append("<a href='" + val.url + "'><div class='eventResult container'><h3>" + date + " - " + val.summary + "</h3><img class='chev' src='../img/noun_128420_cc.svg'><h5>" + val.location + " at " + time +"</h5></div></a>");
    			
    		});
        },
        error: function (e) {
            alert('error');
        }
    });
});

// function array.sort(a, b) {
//     return new Date(b.dtstamp) - new Date(a.dtstamp);
// }


