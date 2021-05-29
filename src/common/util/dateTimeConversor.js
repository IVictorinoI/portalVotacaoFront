export function convertStringToTime(dateTime) {
    if(dateTime == '1899-12-30T00:00:00.000Z')
        return

    return dateTime.substr(11, 8)
}