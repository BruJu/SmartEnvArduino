
function feedback(feedBackValue) {

}

function trigger() {
    $.ajax({
        url: 'request',
        data: {
            type: 'lightOn',
            ambiance: $("#ambiance").val()

        },
        type: 'POST'
    });
}
