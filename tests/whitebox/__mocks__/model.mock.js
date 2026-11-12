// Tạo mock cho mongoose model
export const createModelMock = () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  deleteMany: jest.fn(),
  deleteOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  exists: jest.fn(),
  countDocuments: jest.fn(),
});
