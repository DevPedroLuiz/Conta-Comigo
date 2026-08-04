import { describe, it, expect, vi, beforeEach } from 'vitest';
import { goalService } from './GoalService';
import { goalRepository } from '../repositories/GoalRepository';

vi.mock('../repositories/GoalRepository', () => ({
  goalRepository: {
    getGoals: vi.fn(),
    getGoalById: vi.fn(),
    createGoal: vi.fn(),
    updateGoal: vi.fn(),
    deleteGoal: vi.fn(),
    getGoalsSummary: vi.fn(),
  }
}));

describe('GoalService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validData: any = {
    name: 'Carro Novo',
    target_amount: 50000,
    current_amount: 10000,
    status: 'active',
    deadline: null,
    description: undefined,
  };

  it('should successfully create a goal', async () => {
    vi.mocked(goalRepository.createGoal).mockResolvedValueOnce({ id: 'goal-1', user_id: 'user-1', ...validData });
    const result = await goalService.createGoal('user-1', validData);
    
    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
    expect(result.data?.id).toBe('goal-1');
    expect(goalRepository.createGoal).toHaveBeenCalledWith({
      user_id: 'user-1',
      ...validData
    });
  });

  it('should fail to create a goal with negative amount', async () => {
    const result = await goalService.createGoal('user-1', { ...validData, current_amount: -100 });
    
    expect(result.data).toBeNull();
    expect(result.error).toBeInstanceOf(Error);
    expect((result.error as Error).message).toBe('O valor inicial não pode ser negativo.');
    expect(goalRepository.createGoal).not.toHaveBeenCalled();
  });

  it('should successfully update a goal', async () => {
    vi.mocked(goalRepository.updateGoal).mockResolvedValueOnce({ id: 'goal-1', user_id: 'user-1', ...validData });
    
    const result = await goalService.updateGoal('user-1', 'goal-1', validData);
    
    expect(result.error).toBeNull();
    expect(result.data?.id).toBe('goal-1');
    expect(goalRepository.updateGoal).toHaveBeenCalledWith('user-1', 'goal-1', validData);
  });

  it('should automatically set status to completed if current >= target on update', async () => {
    const updatedData = { ...validData, current_amount: 50000 };
    vi.mocked(goalRepository.updateGoal).mockResolvedValueOnce({ id: 'goal-1', user_id: 'user-1', ...updatedData, status: 'completed' });
    
    const result = await goalService.updateGoal('user-1', 'goal-1', updatedData);
    
    expect(result.error).toBeNull();
    expect(goalRepository.updateGoal).toHaveBeenCalledWith('user-1', 'goal-1', {
      ...updatedData,
      status: 'completed'
    });
  });

  it('should calculate progress correctly and update goal', async () => {
    vi.mocked(goalRepository.getGoalById).mockResolvedValueOnce({ id: 'goal-1', user_id: 'user-1', ...validData });
    vi.mocked(goalRepository.updateGoal).mockResolvedValueOnce({ 
      id: 'goal-1', 
      user_id: 'user-1', 
      ...validData,
      current_amount: 15000 
    });

    const result = await goalService.addProgress('user-1', 'goal-1', 5000);
    
    expect(result.error).toBeNull();
    expect(goalRepository.updateGoal).toHaveBeenCalledWith('user-1', 'goal-1', {
      current_amount: 15000,
      status: 'active'
    });
  });

  it('should successfully delete a goal', async () => {
    vi.mocked(goalRepository.deleteGoal).mockResolvedValueOnce();
    
    const result = await goalService.deleteGoal('user-1', 'goal-1');
    
    expect(result.error).toBeNull();
    expect(goalRepository.deleteGoal).toHaveBeenCalledWith('user-1', 'goal-1');
  });
});
