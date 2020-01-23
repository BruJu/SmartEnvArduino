function feedback(feedBackValue) {
    $.ajax({
        url: 'request',
        data: {
            type: 'feedback',
            feedback: feedBackValue
        },
        type: 'POST'
    });
}

function trigger() {
    $.ajax({
        url: 'request',
        data: {
            type: 'on'
        },
        type: 'POST'
    });
}

function changeAmbiance() {
    $.ajax({
        url: 'request',
        data: {
            type: 'ambiance',
            ambiance: $('#ambiance').val()
        },
        type: 'POST'
    })
}