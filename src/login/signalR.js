import consts from '../consts'

export function connect() {
    var connection = $.connection(`${consts.API_URL}/signalr`);
    connection.error(function(error){
        console.log(error);
    });
    connection.received(function (data) {
        console.log('The time is ' + data.time.toString());
    });

    connection.start().done(function() {
        console.log("connection started!");
    });

}