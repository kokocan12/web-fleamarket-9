import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Connection } from 'mysql2/promise';
import { MYSQL_CONNECTION } from 'src/constants';
import { ChatRoomResponseDto } from './dto/chat-room-response.dto';
import { CreateChatRoomResponseDto } from './dto/create-chat-room-response.dto';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import Imysql from 'mysql2/typings/mysql/lib/protocol/packets';

@Injectable()
export class ChatService {
  constructor(@Inject(MYSQL_CONNECTION) private conn: Connection) {}

  async create(
    createChatDto: CreateChatDto,
  ): Promise<CreateChatRoomResponseDto> {
    try {
      const { sellerId, buyerId, itemId } = createChatDto;

      const existChatRoomId = await this.chatRoomExist(createChatDto);

      if (existChatRoomId) {
        return { chatId: existChatRoomId };
      }

      const sql = `
      INSERT INTO CHAT (
        sellerId
      , buyerId
      , itemId) 
      VALUES (
        ${sellerId}
      , ${buyerId}
      , ${itemId}
      );`;

      const [insertRes]: [Imysql.ResultSetHeader, Imysql.FieldPacket[]] =
        await this.conn.query(sql);

      return {
        chatId: insertRes.insertId,
      };
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  async chatRoomExist(createChatDto: CreateChatDto) {
    try {
      const { sellerId, buyerId, itemId } = createChatDto;

      const [chatRoom]: [Imysql.ResultSetHeader, Imysql.FieldPacket[]] =
        await this.conn.query(
          `SELECT idx
             FROM CHAT 
            WHERE sellerId = ${sellerId} 
              AND buyerId = ${buyerId} 
              AND itemId = ${itemId};`,
        );

      if (chatRoom[0]) {
        return chatRoom[0].idx;
      }

      return null;
    } catch (err) {
      return null;
    }
  }

  findAll(userId, itemId): ChatRoomResponseDto[] {
    return;
  }

  sendMessage(id: number) {
    return;
  }

  readMessage(id: number) {
    return;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
