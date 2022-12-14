import { Inject, Injectable } from '@nestjs/common';
import { MYSQL_CONNECTION } from 'src/constants';
import {
  CreateUserResponseFailDto,
  CreateUserResponseSuccessDto,
} from './dto/create-user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import {
  GetUserResponseFailDto,
  GetUserResponseSuccessDto,
} from './dto/get-user-response.dto';
import Imysql from 'mysql2/typings/mysql/lib/protocol/packets';

import { Connection } from 'mysql2/promise';
import { SHA256 } from 'crypto-js';

@Injectable()
export class UsersService {
  constructor(@Inject(MYSQL_CONNECTION) private conn: Connection) {}

  async create(
    createUserDto: CreateUserDto,
  ): Promise<CreateUserResponseSuccessDto | CreateUserResponseFailDto> {
    const { id, password, name } = createUserDto;

    try {
      if (!id) throw '아이디를 입력해주세요';
      if (!password) throw '패스워드를 입력해주세요';
      if (!name) throw '이름을 입력해주세요';

      const existingId = await this.getUserInfoById(id);

      if (existingId.id) throw '이미 존재하는 아이디입니다.';

      const hashedPassword = SHA256(password).toString();

      const [insertRes]: [Imysql.ResultSetHeader, Imysql.FieldPacket[]] =
        await this.conn.query(
          `INSERT INTO USER (id, password, name) VALUES ('${id}', '${hashedPassword}', '${name}')`,
        );

      await this.conn.query(
        `INSERT INTO USER_LOCATION (userId, locationId) VALUES ('${insertRes.insertId}', 478)`,
      );

      return {
        idx: insertRes.insertId,
        id,
        name,
        message: null,
      };
    } catch (err) {
      return {
        idx: null,
        id: null,
        name: null,
        message: err,
      };
    }
  }

  async getUserLocationByIdx(idx: number) {
    const [location]: [Imysql.ResultSetHeader, Imysql.FieldPacket[]] =
      await this.conn.query(`SELECT USER_LOCATION.userId as userId
                                  , USER_LOCATION.locationId as locationId
                                  , LOCATION.name as locationName
                                  , LOCATION.code as locationCode
                              FROM USER_LOCATION
                             INNER JOIN LOCATION 
                                ON USER_LOCATION.locationId = LOCATION.idx
                             WHERE USER_LOCATION.userId = ${idx}`);
    return location;
  }

  async getUserInfoByIdx(
    idx: number,
  ): Promise<GetUserResponseSuccessDto | GetUserResponseFailDto> {
    const [user]: [Imysql.ResultSetHeader, Imysql.FieldPacket[]] =
      await this.conn.query(
        `SELECT id, password, name FROM USER WHERE idx = ${idx}`,
      );

    return user[0]
      ? {
          idx,
          id: user[0].id,
          name: user[0].name,
          location: await this.getUserLocationByIdx(idx),
        }
      : {
          message: '존재하지 않는 사용자입니다.',
        };
  }

  async getUserInfoById(id: string) {
    const [user]: [Imysql.ResultSetHeader, Imysql.FieldPacket[]] =
      await this.conn.query(
        `SELECT idx, id, password, name FROM USER WHERE id = '${id}'`,
      );

    return user[0]
      ? {
          idx: user[0].idx,
          id: user[0].id,
          name: user[0].name,
          password: user[0].password,
          location: await this.getUserLocationByIdx(user[0]?.idx),
        }
      : {
          message: '존재하지 않는 사용자입니다.',
        };
  }

  async getUsersByLocationId(
    locationId: number,
  ): Promise<{ idx: number; userId: number }[]> {
    try {
      const [users] = (await this.conn.query(
        `select idx, userId FROM USER_LOCATION where locationId = ${locationId}`,
      )) as any;

      return users;
    } catch (err) {
      return [];
    }
  }

  async createGithubUser(id: string, name: string) {
    try {
      const randomPassword = SHA256(Math.random().toString()).toString();
      const [insertRes]: [Imysql.ResultSetHeader, Imysql.FieldPacket[]] =
        await this.conn.query(
          `INSERT INTO USER (id, password, name) VALUES ('${id}', '${randomPassword}', '${name}')`,
        );

      await this.conn.query(
        `INSERT INTO USER_LOCATION (userId, locationId) VALUES ('${insertRes.insertId}', 478)`,
      );

      return {
        idx: insertRes.insertId,
        id,
        name,
        message: null,
      };
    } catch (err) {
      return {
        idx: null,
        id: null,
        name: null,
        message: err,
      };
    }
  }
}
