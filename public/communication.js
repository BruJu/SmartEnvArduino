

function feedback(feedBackValue) {

}

function trigger() {
    $.ajax({
        url: 'request',
        data: {
            aaaa: 'chaton'
        },
        type: 'POST'
    });
}
