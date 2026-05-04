async function carregarDados() {

    const res = await fetch('https://didactic-space-dollop-45qvg64974jf7w6-3000.app.github.dev/api/status-banheiros')
    const dados = await res.json()

    const container = document.getElementById('container')
    container.innerHTML = ''

    let total = 1
    let criticos = 0
    let atencao = 0

    let classe = ''
    let status = ''
    let valor = ''
    let distancia = '--'
    let nome = 'Banheiro Professores'

    if (!dados || dados.length === 0 || !dados[0] || dados[0].nivel === undefined) {

        classe = 'offline'
        status = 'SEM SENSOR / SEM CONEXÃO'
        valor = '--'

    } else {

        const item = dados[0]
        nome = item.sensor_id

        if (item.nivel < 20) {
            classe = 'critico'
            status = 'SEM PAPEL - REPOSIÇÃO IMEDIATA'
            criticos++
        } 
        else if (item.nivel < 50) {
            classe = 'atencao'
            status = 'POUCO PAPEL - REPOSIÇÃO EM BREVE'
            atencao++
        } 
        else {
            classe = 'ok'
            status = 'ABASTECIDO'
        }

        valor = item.nivel + '%'
        distancia = item.distancia ? item.distancia.toFixed(1) + ' cm' : '--'
    }

    const card = document.createElement('div')
    card.className = `card ${classe}`

    card.innerHTML = `
        <h3>${nome}</h3>

        <div class="nivel">${valor}</div>

        <div class="status">${status}</div>

        <div class="distancia">Sensor: ${distancia}</div>

        <div class="barra">
            <div class="progresso" style="width:${valor === '--' ? 0 : valor}"></div>
        </div>
    `

    container.appendChild(card)

    document.getElementById('total').innerText = total
    document.getElementById('criticos').innerText = criticos
    document.getElementById('atencao').innerText = atencao
}

setInterval(carregarDados, 3000)
carregarDados()