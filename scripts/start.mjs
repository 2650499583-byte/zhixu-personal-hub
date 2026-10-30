import { createServer } from 'vite'

const port = Number.parseInt(process.env.PORT || '3000', 10)
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid TCP port')
}

const server = await createServer({
  server: {
    host: '0.0.0.0',
    port,
    strictPort: true,
    allowedHosts: true,
  },
})

await server.listen()
console.log(`Zhixu is listening on port ${port}`)

async function shutdown() {
  await server.close()
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
