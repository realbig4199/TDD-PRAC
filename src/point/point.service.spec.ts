/**
 * @author 김진태 <realbig419@gmail.com>
 * @description PointService 단위 테스트
 */

import { UserPointTable } from '../database/userpoint.table';
import { PointService } from './point.service';
import { PointHistoryTable } from '../database/pointhistory.table';
import { Test, TestingModule } from '@nestjs/testing';
import { PointBody } from './point.dto';
import { UserPoint } from './point.model';

/**
 * @author 김진태 <realbig419@gmail.com>
 * @description 포인트 충전 테스트
 * 행동 분석
 * 1. 아이디 파라미터와 충전 포인트 본문을 넘겨 받는다.
 * 2. 아이디를 검증한다.
 * 3. 충전 포인트를 검증한다.
 * 4. 아이디와 충전 포인트를 활용해 포인트를 충전한다.
 * 5. 결과를 반환한다.
 *
 * 테스트 케이스
 * - 아이디가 존재하지 않을 경우 충전을 실패한다.
 * - 충전 포인트가 0이면 충전을 실패한다.
 * - 충전 포인트가 음수이면 충전을 실패한다.
 */
describe('포인트 충전 테스트', () => {
	let service: PointService;
	let userDb: UserPointTable;
	let historyDb: PointHistoryTable;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PointService,
				{
					provide: UserPointTable,
					useValue: {
						selectById: jest.fn(),
						insertOrUpdate: jest.fn(),
					},
				},
				{
					provide: PointHistoryTable,
					useValue: {
						insert: jest.fn(),
						selectAllByUserId: jest.fn(),
					},
				},
			],
		}).compile();

		service = module.get<PointService>(PointService);
		userDb = module.get<UserPointTable>(UserPointTable);
		historyDb = module.get<PointHistoryTable>(PointHistoryTable);
	});

	// 아이디가 존재하지 않을 경우
	test('아이디가 존재하지 않을 경우, 충전을 실패한다.', async () => {
		const userId = 999;
		const dto: PointBody = { amount: 50 };

		jest.spyOn(userDb, 'selectById').mockResolvedValue(undefined);

		await expect(service.charge(userId, dto)).rejects.toThrow(
			`존재하지 않는 사용자(${userId})`,
		);

		expect(userDb.selectById).toHaveBeenCalledWith(userId);
		expect(userDb.insertOrUpdate).not.toHaveBeenCalled(); // insertOrUpdate는 호출되지 않아야 함
	});

	// 충전 포인트가 0인 경우
	test('충전 포인트가 0이면 충전을 실패한다.', async () => {
		const userId = 1;
		const mockUserPoint: UserPoint = {
			id: userId,
			point: 100,
			updateMillis: Date.now(),
		};

		jest.spyOn(userDb, 'selectById').mockResolvedValue(mockUserPoint);

		await expect(service.charge(userId, { amount: 0 })).rejects.toThrow(
			'유효하지 않은 충전 포인트(0)',
		);

		expect(userDb.selectById).toHaveBeenCalledWith(userId);
		expect(userDb.insertOrUpdate).not.toHaveBeenCalled(); // insertOrUpdate는 호출되지 않아야 함
	});

	// 충전 포인트가 음수인 경우
	test('충전 포인트가 음수이면 충전을 실패한다.', async () => {
		const userId = 1;
		const mockUserPoint: UserPoint = {
			id: userId,
			point: 100,
			updateMillis: Date.now(),
		};

		jest.spyOn(userDb, 'selectById').mockResolvedValue(mockUserPoint);

		await expect(service.charge(userId, { amount: -50 })).rejects.toThrow(
			'유효하지 않은 충전 포인트(-50)',
		);

		expect(userDb.selectById).toHaveBeenCalledWith(userId);
		expect(userDb.insertOrUpdate).not.toHaveBeenCalled(); // insertOrUpdate는 호출되지 않아야 함
	});
});
