import { config, pragmaticHref } from '@/constants'
import { getTableResult, setTableResult, type ResultTable } from '@/database'
import { WebSocket } from 'ws'

const PING_INTERVAL = 10_000
const MAX_RECONNECT_ATTEMPTS = 10
const RECONNECT_INTERVAL = 10_000

let reconnectAttempts = 0
let pingInterval: NodeJS.Timeout | null = null

const startPragmatic = (sendAllClients: (data: any) => void): WebSocket => {
  if (config.WS_PRAGMATIC === undefined) {
    throw new Error('WS_PRAGMATIC is not defined')
  }

  const wssPragmatic = new WebSocket(config.WS_PRAGMATIC, {})

  wssPragmatic.onopen = () => {
    console.log('Pragmatic connected')

    wssPragmatic.send(JSON.stringify({
      type: 'available',
      casinoId: 'ppcdg00000003811'
    }))

    wssPragmatic.send(JSON.stringify({
      type: 'subscribe',
      casinoId: 'ppcdg00000003811',
      key: [
        '221a2',
        '270',
        '28201',
        '292',
        '950',
        '204',
        '28301',
        '28401',
        '227',
        '211a1',
        '266',
        '240',
        '230',
        '225',
        '545',
        '208',
        '203',
        '201',
        '210',
        '226',
        '206',
        '205',
        '234'
      ],
      currency: 'RUB'
    }))

    pingInterval = setInterval(() => {
      wssPragmatic.send(JSON.stringify({ event: 'ping' }))
    }, PING_INTERVAL)
  }

  wssPragmatic.onmessage = (event) => {
    const json = JSON.parse(event?.data as string)

    const tableId = json?.tableId
    const tableName = json?.tableName
    const tableImage = json?.tableImage
    const last20Results = json?.last20Results ?? []

    if (tableId === undefined) {
      return
    }

    const resultTable: ResultTable = {
      provaiderName: 'pragmatic',
      tableId,
      tableName,
      tableImage,
      resultGames: (last20Results).map((game: { color: string, result: string }) => ({
        color: game.color,
        result: +game.result
      })),
      href: pragmaticHref[tableId as keyof typeof pragmaticHref]
    }

    const isNewResult = setTableResult(tableId, resultTable)

    if (isNewResult) {
      sendAllClients(JSON.stringify({
        event: 'games',
        tableId,
        data: getTableResult(tableId)
      }))
    }
  }

  wssPragmatic.onerror = (event) => {
    console.log('Pragmatic error', event)
  }

  wssPragmatic.onclose = () => {
    console.log('Pragmatic disconnected')

    if (pingInterval !== null) {
      clearInterval(pingInterval)
    }

    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++

      setTimeout(() => {
        wssPragmatic.removeAllListeners()

        startPragmatic(sendAllClients)
      }, RECONNECT_INTERVAL * reconnectAttempts)
    }
  }

  return wssPragmatic
}

export { startPragmatic }
