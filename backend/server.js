const express = require('express')
const cors = require('cors')
const path = require('path')
const pool = require('./db')

const app = express()

app.use(cors())
app.use(express.json({ limit: '1mb' }))

// FRONTEND
app.use(express.static(path.join(__dirname, 'public')))

// POST - RECEBE DADOS DO ESP32
app.post('/api/sensor-data', async (req, res) => {
    const { sensor_id, nivel, distancia } = req.body

    console.log("RECEBIDO:", req.body)

    try {
        await pool.query(
            'INSERT INTO leituras (sensor_id, nivel, distancia) VALUES ($1, $2, $3)',
            [sensor_id, nivel, distancia]
        )

        res.json({ status: 'ok' })
    } catch (err) {
        console.error("ERRO INSERT:", err)
        res.status(500).json({ erro: err.message })
    }
})

// GET - ÚLTIMO VALOR DE CADA BANHEIRO
app.get('/api/status-banheiros', async (req, res) => {
    try {
        const SENSOR = "Banheiro Professores"

        const result = await pool.query(`
            SELECT sensor_id, nivel, distancia, timestamp
            FROM leituras
            WHERE sensor_id = $1
            ORDER BY timestamp DESC
            LIMIT 1
        `, [SENSOR])

        const agora = new Date()

        if (result.rows.length === 0) {
            return res.json([{
                sensor_id: SENSOR,
                status_conexao: "offline"
            }])
        }

        const dado = result.rows[0]

        const tempo = (agora - new Date(dado.timestamp)) / 1000

        if (tempo > 15) {
            return res.json([{
                sensor_id: SENSOR,
                status_conexao: "offline"
            }])
        }

        res.json([{
            ...dado,
            status_conexao: "online"
        }])

    } catch (err) {
        console.error(err)
        res.status(500).json({ erro: err.message })
    }
})
// ROTA PRINCIPAL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000')
})