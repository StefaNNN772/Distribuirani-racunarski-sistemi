import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.callbacks = {
      stock_added: [],
      stock_deleted: [],
      prices_updated: [],
      connection_error: []
    };
  }

  connect(apiUrl) {
    if (this.socket && this.socket.connected) {
      return;
    }

    this.socket = io(apiUrl, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.callbacks.connection_error.forEach(callback => callback(error));
    });

    this.socket.on('stock_added', (data) => {
      console.log('Stock added event received:', data);
      this.callbacks.stock_added.forEach(callback => callback(data));
    });

    this.socket.on('stock_deleted', (data) => {
      console.log('Stock deleted event received:', data);
      this.callbacks.stock_deleted.forEach(callback => callback(data));
    });

    this.socket.on('prices_updated', (data) => {
      console.log('Prices updated event received:', data);
      this.callbacks.prices_updated.forEach(callback => callback(data));
    });

    this.socket.on('joined_room', (data) => {
      console.log('Joined room:', data.room);
    });
  }

  joinUserRoom(userId) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join_user_room', { user_id: userId });
    }
  }

  leaveUserRoom(userId) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leave_user_room', { user_id: userId });
    }
  }

  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
  }

  off(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new WebSocketService();