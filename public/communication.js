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

function sendHistoryRequest() {
    /*$.ajax({
        url: 'request',
        data: {
            type: 'historyRequest'
        },
        type: 'POST'
    }).done((data) => {*/
        let sample = {
            'Blood,0,0,0': {
                red: 800,
                green: 160,
                blue: 40
            }
        };
        let table = $('#history');
        table.empty();
        for(let index in sample) {
            let [ambiance, input_red, input_green, input_blue] = index.split(',');
            let output_red = sample[index].red;
            let output_green = sample[index].green;
            let output_blue = sample[index].blue;
            let row = $('<tr>');
            let ambiance_cell = $('<td>');
            let ambiance_div = $('<div>');
            ambiance_div.html(ambiance);
            ambiance_cell.append(ambiance_div);
            let input_cell = $('<td>');
            input_cell.css('background-color', 'rgb(' + input_red + ',' + input_green + ',' + input_blue + ')');
            let output_cell = $('<td>');
            output_cell.css('background-color', `rgb(${output_red},${output_green},${output_blue})`);
            row.append(ambiance_cell);
            row.append(input_cell);
            row.append(output_cell);
            table.append(row);
        }
    //});
}