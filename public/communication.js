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

function simple_request(kind) {
    $.ajax({
        url: 'request',
        data: {
            type: kind
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

function pickColor() {
    let redValue = parseInt($('#color_manual_red').val());
    let greenValue = parseInt($('#color_manual_green').val());
    let blueValue = parseInt($('#color_manual_blue').val());

    $.ajax({
        url: 'request',
        data: {
            type: 'color_choice',
            color: [redValue, greenValue, blueValue]
        },
        type: 'POST'
    });

}


function sendLearnInteraction() {
    let redValue = parseInt($('#color_manual_red').val());
    let greenValue = parseInt($('#color_manual_green').val());
    let blueValue = parseInt($('#color_manual_blue').val());

    $.ajax({
        url: 'request',
        data: {
            type: 'color_learn',
            color: [redValue, greenValue, blueValue]
        },
        type: 'POST'
    });
}

$('#color_manual_red').on('input', pickColor);
$('#color_manual_green').on('input', pickColor);
$('#color_manual_blue').on('input', pickColor);


function sendHistoryRequest() {
    $.ajax({
        url: 'request',
        data: {
            type: 'historyRequest'
        },
        type: 'POST'
    }).done((sample) => {
        let table = $('#history');
        table.empty();
        
        for(let index in sample) {
            let [ambiance, input_red, input_green, input_blue] = index.split(',');
            let filter_input = function(v) { return parseInt(v) * 255; };
            input_red = filter_input(input_red);
            input_green = filter_input(input_green);
            input_blue = filter_input(input_blue);
            let output_red = parseInt(sample[index].red) * 255 / 60;
            let output_green = parseInt(sample[index].green) * 255 / 60;
            let output_blue = parseInt(sample[index].blue) * 255 / 60;
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
    });
}

$(document).ready(function() {
    $.ajax({
        url: 'request',
        data: {
            type: 'request_current_ambiance'
        },
        type: 'POST'
    }).done(function (data) {
        $("#ambiance").val(data['current_ambiance']);
    });
});
