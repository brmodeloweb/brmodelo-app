jest.mock('./model', () => ({
	findOne: jest.fn(),
}));

const modelRepository = require('./model');
const modelService = require('./service');

afterEach(() => {
	jest.clearAllMocks();
});

describe('model service - getById', () => {
	test('should reject with 404 when model not found', async () => {
		modelRepository.findOne.mockResolvedValue(null);

		await expect(modelService.getById('missing-id', 'user-1')).rejects.toMatchObject({
			message: 'model not found',
			status: 404,
		});

		expect(modelRepository.findOne).toHaveBeenCalledWith({ _id: 'missing-id' });
	});

	test('should reject with 401 when user is not the owner', async () => {
		modelRepository.findOne.mockResolvedValue({ _id: 'm1', who: 'other-user' });

		await expect(modelService.getById('m1', 'user-1')).rejects.toMatchObject({
			message: 'user not authorired',
			status: 401,
		});

		expect(modelRepository.findOne).toHaveBeenCalledWith({ _id: 'm1' });
	});

	test('should resolve with model when user is the owner', async () => {
		const mockModel = { _id: 'm2', who: 'user-1', name: 'My Model' };
		modelRepository.findOne.mockResolvedValue(mockModel);

		await expect(modelService.getById('m2', 'user-1')).resolves.toBe(mockModel);
		expect(modelRepository.findOne).toHaveBeenCalledWith({ _id: 'm2' });
	});
});
