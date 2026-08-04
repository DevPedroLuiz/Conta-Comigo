import { describe, it, expect, vi, beforeEach } from 'vitest';
import { categoryService } from './CategoryService';
import { categoryRepository } from '../repositories/CategoryRepository';

vi.mock('../repositories/CategoryRepository', () => ({
  categoryRepository: {
    getCategories: vi.fn(),
    getCategoryById: vi.fn(),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn(),
  }
}));

describe('CategoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validData: any = {
    name: 'Streaming',
    type: 'EXPENSE',
    color: '#FF0000',
    icon: 'smile',
  };

  it('should successfully create a category', async () => {
    vi.mocked(categoryRepository.createCategory).mockResolvedValueOnce({ id: 'cat-1', user_id: 'user-1', is_default: false, ...validData });
    const result = await categoryService.createCategory('user-1', validData);
    
    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
    expect(result.data?.id).toBe('cat-1');
    expect(categoryRepository.createCategory).toHaveBeenCalledWith({
      user_id: 'user-1',
      ...validData
    });
  });

  it('should successfully update a custom category', async () => {
    vi.mocked(categoryRepository.getCategoryById).mockResolvedValueOnce({ id: 'cat-1', user_id: 'user-1', is_default: false, ...validData });
    vi.mocked(categoryRepository.updateCategory).mockResolvedValueOnce({ id: 'cat-1', user_id: 'user-1', is_default: false, ...validData });
    
    const result = await categoryService.updateCategory('user-1', 'cat-1', validData);
    
    expect(result.error).toBeNull();
    expect(result.data?.id).toBe('cat-1');
    expect(categoryRepository.updateCategory).toHaveBeenCalledWith('user-1', 'cat-1', validData);
  });

  it('should not allow update of default category', async () => {
    vi.mocked(categoryRepository.getCategoryById).mockResolvedValueOnce({ id: 'cat-1', user_id: null, is_default: true, ...validData });
    
    const result = await categoryService.updateCategory('user-1', 'cat-1', validData);
    
    expect(result.data).toBeNull();
    expect(result.error).toBeInstanceOf(Error);
    expect((result.error as Error).message).toBe('Não é possível editar uma categoria padrão.');
    expect(categoryRepository.updateCategory).not.toHaveBeenCalled();
  });

  it('should successfully delete a custom category', async () => {
    vi.mocked(categoryRepository.getCategoryById).mockResolvedValueOnce({ id: 'cat-1', user_id: 'user-1', is_default: false, ...validData });
    vi.mocked(categoryRepository.deleteCategory).mockResolvedValueOnce();
    
    const result = await categoryService.deleteCategory('user-1', 'cat-1');
    
    expect(result.error).toBeNull();
    expect(categoryRepository.deleteCategory).toHaveBeenCalledWith('user-1', 'cat-1');
  });

  it('should not allow deletion of default category', async () => {
    vi.mocked(categoryRepository.getCategoryById).mockResolvedValueOnce({ id: 'cat-1', user_id: null, is_default: true, ...validData });
    
    const result = await categoryService.deleteCategory('user-1', 'cat-1');
    
    expect(result.error).toBeInstanceOf(Error);
    expect((result.error as Error).message).toBe('Não é possível excluir uma categoria padrão.');
    expect(categoryRepository.deleteCategory).not.toHaveBeenCalled();
  });
});
