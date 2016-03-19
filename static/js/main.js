$(document).ready(function() {
	// $("#events").append("<div> hello </div>");
});

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
        	console.log(val.categories);
        	//$("#events").append("<div> hello </div>");
			$("#events").append("<div class='eventResult'>" + val.categories + "</div>");
			
		});
    },
    error: function (e) {
        alert('error');
    }
});


