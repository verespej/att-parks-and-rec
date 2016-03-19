$(document).ready(function() {
    var url = "data/parks.json";
    $.ajax({
        type: 'GET',
        url: url,
        async: false,
        contentType: "application/json",
        dataType: 'json',
        success: function (data) {
            eventData = data.events;
            $.each(eventData, function(i, val) {
                var date = $.format.date(val.dtstamp, "MM/dd");
                var time = $.format.date(val.dtstart, "h:mm a");
            	console.log(val);
            	//$("#events").append("<div> hello </div>");
    			$("#events").append("<div class='eventResult container'><h3>" + date + " - " + val.summary + "<img class='chev' src='../img/noun_128420_cc.svg'></h3><h5>" + val.location + " at " + time +"</h5></div>");
    			
    		});
        },
        error: function (e) {
            alert('error');
        }
    });
});