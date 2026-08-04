import { categoryRepository } from '../repositories/CategoryRepository';
import { CategoryFormData } from '../schemas/category.schemas';

export class CategoryService {
  async getCategories(userId: string) {
    try {
      const data = await categoryRepository.getCategories(userId);
      return { data, error: null };
    } catch (error) {
      console.error('Error getting categories:', error);
      return { data: null, error };
    }
  }

  async getCategoryById(userId: string, categoryId: string) {
    try {
      const data = await categoryRepository.getCategoryById(userId, categoryId);
      return { data, error: null };
    } catch (error) {
      console.error('Error getting category:', error);
      return { data: null, error };
    }
  }

  async createCategory(userId: string, data: CategoryFormData) {
    try {
      const newCategory = {
        user_id: userId,
        name: data.name,
        type: data.type,
        color: data.color || '#888888',
        icon: data.icon || 'tag',
      };

      const created = await categoryRepository.createCategory(newCategory);
      return { data: created, error: null };
    } catch (error) {
      console.error('Error creating category:', error);
      return { data: null, error };
    }
  }

  async updateCategory(userId: string, categoryId: string, data: CategoryFormData) {
    try {
      // Check if it's default
      const category = await categoryRepository.getCategoryById(userId, categoryId);
      if (!category) {
        throw new Error('Categoria não encontrada.');
      }
      if (category.is_default) {
        throw new Error('Não é possível editar uma categoria padrão.');
      }

      const updates = {
        name: data.name,
        type: data.type,
        color: data.color || '#888888',
        icon: data.icon || 'tag',
      };

      const updated = await categoryRepository.updateCategory(userId, categoryId, updates);
      return { data: updated, error: null };
    } catch (error) {
      console.error('Error updating category:', error);
      return { data: null, error };
    }
  }

  async deleteCategory(userId: string, categoryId: string) {
    try {
      // Check if it's default
      const category = await categoryRepository.getCategoryById(userId, categoryId);
      if (!category) {
        throw new Error('Categoria não encontrada.');
      }
      if (category.is_default) {
        throw new Error('Não é possível excluir uma categoria padrão.');
      }

      await categoryRepository.deleteCategory(userId, categoryId);
      return { error: null };
    } catch (error) {
      console.error('Error deleting category:', error);
      return { error };
    }
  }
}

export const categoryService = new CategoryService();
