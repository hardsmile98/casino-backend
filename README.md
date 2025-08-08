# Casino Backend

Backend сервер для казино с поддержкой WebSocket подключений и автоматического реконнекта.

## Особенности

- **Автоматический реконнект WebSocket**: Экспоненциальная задержка с максимальным количеством попыток
- **Graceful shutdown**: Корректное завершение работы сервера
- **Ping/Pong**: Поддержка keep-alive для WebSocket соединений
- **Модульная архитектура**: Переиспользуемый WebSocketManager

## Установка

```bash
npm install
```

## Настройка

Создайте файл `.env` в корне проекта:

```env
API_PORT=3000
WS_PORT=3001
WS_PRAGMATIC=wss://your-pragmatic-server.com
ENV_MODE=development
```

## Запуск

```bash
npm start
```

## WebSocket Реконнект

### WebSocketManager

Класс `WebSocketManager` предоставляет автоматический реконнект с настраиваемыми параметрами:

```typescript
const manager = new WebSocketManager({
  url: 'wss://example.com',
  maxReconnectAttempts: 10,        // Максимальное количество попыток
  initialReconnectDelay: 1000,     // Начальная задержка (мс)
  maxReconnectDelay: 30000,        // Максимальная задержка (мс)
  pingInterval: 10000,             // Интервал ping (мс)
  onOpen: () => console.log('Connected'),
  onClose: (code, reason) => console.log('Disconnected'),
  onError: (error) => console.error('Error:', error),
  onMessage: (data) => console.log('Message:', data)
})

manager.connect()
```

### Алгоритм реконнекта

1. **Экспоненциальная задержка**: Время между попытками увеличивается по формуле `initialDelay * 2^attempt`
2. **Максимальная задержка**: Ограничение максимального времени ожидания
3. **Случайность**: Добавляется случайная составляющая для избежания thundering herd
4. **Сброс счетчика**: При успешном подключении счетчик попыток сбрасывается

### Примеры задержек

- Попытка 1: ~1000ms
- Попытка 2: ~2000ms  
- Попытка 3: ~4000ms
- Попытка 4: ~8000ms
- Попытка 5: ~16000ms
- Попытка 6+: ~30000ms (максимум)

## API

### WebSocketManager

- `connect()`: Установить соединение
- `disconnect()`: Разорвать соединение
- `send(data)`: Отправить данные
- `isConnected()`: Проверить статус соединения
- `getConnectionState()`: Получить состояние соединения

### Pragmatic Module

- `startPragmatic()`: Запустить подключение к Pragmatic
- `stopPragmatic()`: Остановить подключение
- `getPragmaticManager()`: Получить менеджер подключения

## Graceful Shutdown

Сервер корректно обрабатывает сигналы завершения:

- `SIGTERM`: Стандартный сигнал завершения
- `SIGINT`: Прерывание (Ctrl+C)

При получении сигнала:
1. Останавливается WebSocketManager
2. Закрывается HTTP сервер
3. Закрывается WebSocket сервер
4. Процесс завершается

## Логирование

Все события подключения логируются в консоль:

```
Attempting to connect to wss://example.com (attempt 1/10)
Successfully connected to wss://example.com
Connection closed: 1000 - Normal closure
Reconnecting in 1500ms...
```

## Разработка

```bash
# Запуск в режиме разработки
npm run dev

# Сборка
npm run build

# Запуск тестов
npm test
``` 