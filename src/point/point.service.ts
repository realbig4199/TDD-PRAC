import { Injectable } from '@nestjs/common';
import { PointHistoryTable } from '../database/pointhistory.table';
import { UserPointTable } from '../database/userpoint.table';
import { PointBody } from './point.dto';
import { UserPoint } from './point.model';

@Injectable()
export class PointService {
	constructor(
		private readonly userDb: UserPointTable,
		private readonly historyDb: PointHistoryTable,
	) {}

	/**
	 * @author 김진태 <realbig419@gmail.com>
	 * @description 포인트 충전
	 * @param id 유저 아이디
	 * @body amount 충전 포인트
	 */
	public async charge(id: number, dto: PointBody): Promise<UserPoint> {
		try {
			if (id === null || typeof id !== 'number') {
				throw new Error(`유효하지 않은 사용자 아이디(${id})`);
			}

			const userPoint = await this.userDb.selectById(id); // 먼저 사용자 존재 여부를 확인
			if (!userPoint) {
				throw new Error(`존재하지 않는 사용자(${id})`);
			}

			const amount = dto.amount;
			if (amount <= 0) {
				throw new Error(`유효하지 않은 충전 포인트(${amount})`); // 0 이하 값
			}

			userPoint.point += dto.amount;
			userPoint.updateMillis = Date.now();
			await this.userDb.insertOrUpdate(userPoint.id, userPoint.point);

			return userPoint;
		} catch (err) {
			throw err;
		}
	}
}
