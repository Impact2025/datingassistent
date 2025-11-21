import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { sql } from '@vercel/postgres';
import type { Socket } from 'socket.io';

interface ConnectedUser {
  socketId: string;
  userType: 'user' | 'agent';
  userId?: number;
  conversationId?: number;
  sessionId?: string;
  lastSeen: Date;
}

interface ChatMessage {
  conversationId: number;
  messageId: string;
  senderType: 'user' | 'agent' | 'system';
  senderId?: number;
  content: string;
  messageType?: string;
  metadata?: Record<string, any>;
}

class LiveChatSocketServer {
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<string, ConnectedUser> = new Map();
  private agentSockets: Map<number, string[]> = new Map(); // agentId -> socketIds[]

  initialize(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production'
          ? ['https://datingassistent.nl']
          : ['http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
    console.log('🔌 Live Chat Socket Server initialized');
  }

  private setupEventHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      console.log(`🔌 User connected: ${socket.id}`);

      // Handle user joining conversation
      socket.on('join_conversation', async (data: {
        sessionId: string;
        userType: 'user' | 'agent';
        userId?: number;
        conversationId?: number;
      }) => {
        await this.handleJoinConversation(socket, data);
      });

      // Handle chat messages
      socket.on('send_message', async (message: ChatMessage) => {
        await this.handleSendMessage(socket, message);
      });

      // Handle typing indicators
      socket.on('typing_start', (data: { conversationId: number }) => {
        this.handleTypingStart(socket, data.conversationId);
      });

      socket.on('typing_stop', (data: { conversationId: number }) => {
        this.handleTypingStop(socket, data.conversationId);
      });

      // Handle agent status updates
      socket.on('agent_status_update', async (data: {
        agentId: number;
        status: string;
        isAvailable: boolean;
      }) => {
        await this.handleAgentStatusUpdate(socket, data);
      });

      // Handle conversation assignment
      socket.on('assign_conversation', async (data: {
        conversationId: number;
        agentId: number;
      }) => {
        await this.handleAssignConversation(socket, data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // Handle presence updates
      socket.on('update_presence', (data: {
        conversationId: number;
        isOnline: boolean;
        currentPage?: string;
      }) => {
        this.handlePresenceUpdate(socket, data);
      });
    });
  }

  private async handleJoinConversation(socket: Socket, data: {
    sessionId: string;
    userType: 'user' | 'agent';
    userId?: number;
    conversationId?: number;
  }) {
    try {
      const { sessionId, userType, userId, conversationId } = data;

      // Store connection info
      this.connectedUsers.set(socket.id, {
        socketId: socket.id,
        userType,
        userId,
        conversationId,
        sessionId,
        lastSeen: new Date()
      });

      // Join conversation room
      if (conversationId) {
        socket.join(`conversation_${conversationId}`);
        console.log(`👤 ${userType} joined conversation ${conversationId}`);

        // Update presence
        await this.updatePresence(conversationId, userType, userId, true);

        // Notify others in conversation
        socket.to(`conversation_${conversationId}`).emit('user_joined', {
          userType,
          userId,
          timestamp: new Date()
        });
      }

      // If agent, track their sockets
      if (userType === 'agent' && userId) {
        const agentSockets = this.agentSockets.get(userId) || [];
        agentSockets.push(socket.id);
        this.agentSockets.set(userId, agentSockets);
      }

      // Send confirmation
      socket.emit('joined_conversation', {
        success: true,
        conversationId,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Error joining conversation:', error);
      socket.emit('error', { message: 'Failed to join conversation' });
    }
  }

  private async handleSendMessage(socket: Socket, message: ChatMessage) {
    try {
      const user = this.connectedUsers.get(socket.id);
      if (!user || !message.conversationId) return;

      // Save message to database
      const messageId = message.messageId || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await sql`
        INSERT INTO chat_messages (
          conversation_id, message_id, sender_type, sender_id,
          message_type, content, metadata, created_at
        ) VALUES (
          ${message.conversationId}, ${messageId}, ${message.senderType},
          ${message.senderId || null}, ${message.messageType || 'text'},
          ${message.content}, ${JSON.stringify(message.metadata || {})}, NOW()
        )
      `;

      // Broadcast to conversation room
      this.io?.to(`conversation_${message.conversationId}`).emit('new_message', {
        ...message,
        messageId,
        timestamp: new Date()
      });

      // If this is from a user, try to assign to agent or notify waiting
      if (message.senderType === 'user') {
        await this.handleUserMessage(message.conversationId);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  private async handleUserMessage(conversationId: number) {
    try {
      // Check if conversation is assigned
      const conversation = await sql`
        SELECT assigned_agent_id, status FROM chat_conversations
        WHERE id = ${conversationId}
      `;

      if (conversation.rows.length === 0) return;

      const conv = conversation.rows[0];

      if (!conv.assigned_agent_id && conv.status === 'waiting') {
        // Notify available agents
        await this.notifyAvailableAgents(conversationId);
      }
    } catch (error) {
      console.error('Error handling user message:', error);
    }
  }

  private async notifyAvailableAgents(conversationId: number) {
    try {
      // Get available agents
      const availableAgents = await sql`
        SELECT id, name FROM chat_agents
        WHERE status = 'online' AND is_available = true
        ORDER BY total_chats_handled ASC
        LIMIT 5
      `;

      // Notify each available agent
      for (const agent of availableAgents.rows) {
        const agentSockets = this.agentSockets.get(agent.id) || [];
        agentSockets.forEach(socketId => {
          this.io?.to(socketId).emit('new_chat_request', {
            conversationId,
            priority: 'normal',
            timestamp: new Date()
          });
        });
      }
    } catch (error) {
      console.error('Error notifying agents:', error);
    }
  }

  private handleTypingStart(socket: Socket, conversationId: number) {
    socket.to(`conversation_${conversationId}`).emit('typing_start', {
      conversationId,
      timestamp: new Date()
    });
  }

  private handleTypingStop(socket: Socket, conversationId: number) {
    socket.to(`conversation_${conversationId}`).emit('typing_stop', {
      conversationId,
      timestamp: new Date()
    });
  }

  private async handleAgentStatusUpdate(socket: Socket, data: {
    agentId: number;
    status: string;
    isAvailable: boolean;
  }) {
    try {
      await sql`
        UPDATE chat_agents
        SET status = ${data.status}, is_available = ${data.isAvailable}, last_activity = NOW()
        WHERE id = ${data.agentId}
      `;

      // Broadcast status update to all agents
      this.io?.emit('agent_status_changed', {
        agentId: data.agentId,
        status: data.status,
        isAvailable: data.isAvailable,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Error updating agent status:', error);
    }
  }

  private async handleAssignConversation(socket: Socket, data: {
    conversationId: number;
    agentId: number;
  }) {
    try {
      // Update conversation assignment
      await sql`
        UPDATE chat_conversations
        SET assigned_agent_id = ${data.agentId},
            status = 'assigned',
            assigned_at = NOW(),
            updated_at = NOW()
        WHERE id = ${data.conversationId}
      `;

      // Notify conversation participants
      this.io?.to(`conversation_${data.conversationId}`).emit('conversation_assigned', {
        conversationId: data.conversationId,
        agentId: data.agentId,
        timestamp: new Date()
      });

      // Update agent's active chats count
      await sql`
        UPDATE chat_agents
        SET last_activity = NOW()
        WHERE id = ${data.agentId}
      `;

    } catch (error) {
      console.error('Error assigning conversation:', error);
    }
  }

  private handlePresenceUpdate(socket: Socket, data: {
    conversationId: number;
    isOnline: boolean;
    currentPage?: string;
  }) {
    // Update presence in database (could be optimized with Redis)
    this.updatePresence(data.conversationId, 'user', undefined, data.isOnline, data.currentPage);
  }

  private async updatePresence(
    conversationId: number,
    userType: string,
    userId?: number,
    isOnline: boolean = true,
    currentPage?: string
  ) {
    try {
      await sql`
        INSERT INTO chat_presence (
          conversation_id, user_type, user_id, is_typing, is_online,
          current_page, last_seen, updated_at
        ) VALUES (
          ${conversationId}, ${userType}, ${userId || null}, false, ${isOnline},
          ${currentPage || null}, NOW(), NOW()
        )
        ON CONFLICT (conversation_id, user_type, user_id)
        DO UPDATE SET
          is_online = ${isOnline},
          current_page = ${currentPage || null},
          last_seen = NOW(),
          updated_at = NOW()
      `;
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }

  private handleDisconnect(socket: Socket) {
    const user = this.connectedUsers.get(socket.id);
    if (user) {
      console.log(`🔌 User disconnected: ${socket.id} (${user.userType})`);

      // Update presence to offline
      if (user.conversationId) {
        this.updatePresence(user.conversationId, user.userType, user.userId, false);
      }

      // Remove from agent sockets if agent
      if (user.userType === 'agent' && user.userId) {
        const agentSockets = this.agentSockets.get(user.userId) || [];
        const filtered = agentSockets.filter(id => id !== socket.id);
        if (filtered.length > 0) {
          this.agentSockets.set(user.userId, filtered);
        } else {
          this.agentSockets.delete(user.userId);
        }
      }

      this.connectedUsers.delete(socket.id);
    }
  }

  // Public methods for external access
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  getOnlineAgentsCount(): number {
    return this.agentSockets.size;
  }

  broadcastToConversation(conversationId: number, event: string, data: any) {
    this.io?.to(`conversation_${conversationId}`).emit(event, data);
  }

  notifyAgent(agentId: number, event: string, data: any) {
    const agentSockets = this.agentSockets.get(agentId) || [];
    agentSockets.forEach(socketId => {
      this.io?.to(socketId).emit(event, data);
    });
  }
}

// Singleton instance
export const liveChatSocketServer = new LiveChatSocketServer();