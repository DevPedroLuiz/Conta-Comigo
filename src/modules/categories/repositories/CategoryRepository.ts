import { supabase } from '../../../core/services/supabase';
import { Category } from '../types/category.types';

export class CategoryRepository {
  async getCategories(userId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .or(`user_id.eq.${userId},is_default.eq.true`)
      .order('name');
    
    if (error) throw error;
    return data as Category[];
  }

  async getCategoryById(userId: string, categoryId: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .or(`user_id.eq.${userId},is_default.eq.true`)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data as Category;
  }

  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at' | 'is_default'>): Promise<Category> {
    const dataToInsert = {
      ...category,
      is_default: false, // User created categories are never default
    };

    const { data, error } = await supabase
      .from('categories')
      .insert(dataToInsert)
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  }

  async updateCategory(userId: string, categoryId: string, updates: Partial<Category>): Promise<Category> {
    // We only update user_id specific categories, RLS handles this, but we explicitly filter
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('user_id', userId)
      .eq('id', categoryId)
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  }

  async deleteCategory(userId: string, categoryId: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('user_id', userId)
      .eq('id', categoryId);

    if (error) throw error;
  }

  async getOrCreateCategoryByName(userId: string, name: string, icon: string, color: string): Promise<Category> {
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .ilike('name', `%${name}%`)
      .limit(1);

    if (categories && categories.length > 0) {
      return categories[0] as Category;
    }

    const { data: newCat, error } = await supabase
      .from('categories')
      .insert({ user_id: userId, name, icon, color })
      .select()
      .single();

    if (error) throw error;
    return newCat as Category;
  }
}

export const categoryRepository = new CategoryRepository();
