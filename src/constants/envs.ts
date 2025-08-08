import dotenv from 'dotenv'

dotenv.config()

const config = {
  API_PORT: process.env.API_PORT !== undefined
    ? +process.env.API_PORT
    : 3000,
  WS_PORT: process.env.WS_PORT !== undefined
    ? +process.env.WS_PORT
    : 3001,
  WS_PRAGMATIC: process.env.WS_PRAGMATIC,
  ENV_MODE: process.env.ENV_MODE
} as const

export { config }
