import express from 'express'
import { WebSocketServer } from 'ws'
import cors from 'cors'
import { config } from '@/constants'
import { startPragmatic } from '@/modules/pragmatic'
import { getResult, resetResult } from './database'

const apiPort = config.API_PORT

const app = express()

app.use(express.json())

app.use(express.urlencoded({ extended: false }))

app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_HOST
}))

const start = (): void => {
  const wss = new WebSocketServer({ port: config.WS_PORT })

  const sendAllClients = (data: any): void => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data)
      }
    })
  }

  resetResult()

  let wssPragmatic = startPragmatic(sendAllClients)

  wss.on('connection', ws => {
    ws.send(JSON.stringify({
      event: 'init',
      data: getResult()
    }))
  })

  app.post('/api/reconnect', function (_, res) {
    if (wssPragmatic?.readyState === WebSocket.OPEN) {
      wssPragmatic.close()
    }

    resetResult()

    wssPragmatic = startPragmatic(sendAllClients)

    res.status(200).json({ success: true })
  })

  app.get('/api/infoConnect', function (_, res) {
    const isOpen = wssPragmatic?.readyState === WebSocket.OPEN

    res.status(200).json({ success: true, isOpen })
  })

  app.listen(apiPort, () => {
    console.log(`Server Launched on ${apiPort} port`)
  })
}

start()
