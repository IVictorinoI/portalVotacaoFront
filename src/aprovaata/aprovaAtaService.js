export function colorCardAprovacao(quant, total) {
    if(quant>=2 || quant==total)
        return "small-box bg-green"

    if(quant>=1)
        return "small-box bg-yellow"

    return "small-box bg-gray"
}
