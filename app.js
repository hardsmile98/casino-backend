require('dotenv').config()
const WebSocket = require('ws')
const express = require('express')
const { createServer } = require('http')
const cors = require('cors')

const app = express()

const port = 3030

const wssPort = 8030

const server = createServer(app).listen(wssPort)

const {
  hrefsPragmatic
} = require('./constants')

const URL_PGRAGMATIC = 'wss://dga.pragmaticplaylive.net/ws'
const PING_INTERVAL = 1000 * 10
const AUTO_RECONNECT_DELAY = 1000 * 30

function appStart () {
  const gamesResult = {}
  let pragmaticWss = null

  const wssServer = new WebSocket.Server({ server })

  wssServer.on('connection', ws => {
    ws.send(JSON.stringify({
      event: 'init',
      data: gamesResult
    }))
  })

  const connectToPragmatic = () => {
    const wssCasino = new WebSocket(URL_PGRAGMATIC, {})
    let intervalId = null

    wssCasino.onmessage = (event) => {
      const json = JSON.parse(event?.data || {})
      const { tableId, tableName, last20Results } = json || {}

      const result = {
        provaiderName: 'pragmatic',
        tableName,
        tableId,
        resultGames: (last20Results || []).map((game) => ({
          color: game.color,
          result: game.result
        })),
        href: hrefsPragmatic[tableId] || '-'
      }
      gamesResult[tableId] = result

      wssServer.clients.forEach(function each (client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            event: 'games',
            tableId,
            data: result
          }))
        }
      })
    }

    wssCasino.onclose = () => {
      clearInterval(intervalId)
      pragmaticWss = null

      setTimeout(() => {
        wssCasino.removeAllListeners()
        pragmaticWss = connectToPragmatic()
      }, AUTO_RECONNECT_DELAY)
    }

    wssCasino.onopen = () => {
      pragmaticWss = wssCasino

      wssCasino.send(JSON.stringify({
        type: 'subscribe',
        casinoId: 'ppcdg00000003811',
        key: [204, 225, 201, 230, 203, 227, 545, 240, 205, 229, 234, 221, 206],
        currency: 'RUB'
      }))

      intervalId = setInterval(() => {
        wssCasino.send(JSON.stringify({ event: 'ping' }))
      }, PING_INTERVAL)
    }

    return wssCasino
  }
  connectToPragmatic()

  app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
  }))
  app.use(express.json())

  app.post('/api/reconnect', function (_, res) {
    if (pragmaticWss?.readyState === WebSocket.OPEN) {
      pragmaticWss.close()
    }

    connectToPragmatic()

    res.status(200).json({ success: true })
  })

  app.get('/api/infoConnect', function (_, res) {
    const isOpen = pragmaticWss?.readyState === WebSocket.OPEN

    res.status(200).json({ success: true, isOpen })
  })

  app.listen(port, () => {
    console.log(`server app on port ${port} 1`)
  })
};

appStart()
