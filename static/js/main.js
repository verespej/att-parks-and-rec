$(document).ready(function() {
    var url = "/api/events";
    $.ajax({
        type: 'GET',
        url: url,
        async: false,
        contentType: "application/json",
        dataType: 'json',
        success: function (events) {
            events.sort(function(first, second) {
                return first.start_time.localeCompare(second.start_time);
            });
            $.each(events, function(i, event_info) {
                var date = $.format.date(event_info.start_time, "MM/dd");
                var time = $.format.date(event_info.start_time, "h:mm a");
    			$("#events").append(
                    "<a href='./event.html?id=" + encodeURIComponent(event_info.guid) + "'>" +
                        "<div class='eventResult container'>" +
                            "<h3>" + date + " - " + event_info.description + "</h3>" +
                            "<img class='chev' src='../img/noun_128420_cc.svg'>" +
                            "<h5>" + event_info.location + " at " + time +"</h5>" +
                        "</div>" +
                    "</a>"
                );
    			
    		});
        },
        error: function (e) {
            alert('error');
        }
    });
});
