import fs from 'fs';
const path = 'src/modules/dashboard/services/DashboardService.test.ts';
let content = fs.readFileSync(path, 'utf8');
content = `import { goalService } from '../../goals/services/GoalService';
vi.mock('../../goals/services/GoalService', () => ({
  goalService: {
    getGoalsSummary: vi.fn(),
  }
}));
` + content;

content = content.replace(
  "vi.mocked(dashboardRepository.getAccountsCount).mockResolvedValueOnce(3);",
  "vi.mocked(dashboardRepository.getAccountsCount).mockResolvedValueOnce(3);\n    vi.mocked(goalService.getGoalsSummary).mockResolvedValueOnce({ data: { activeGoals: 0, averageProgress: 0, nextToExpire: null }, error: null });"
);

content = content.replace(
  "vi.mocked(dashboardRepository.getAccountsCount).mockResolvedValueOnce(0);",
  "vi.mocked(dashboardRepository.getAccountsCount).mockResolvedValueOnce(0);\n    vi.mocked(goalService.getGoalsSummary).mockResolvedValueOnce({ data: { activeGoals: 0, averageProgress: 0, nextToExpire: null }, error: null });"
);

fs.writeFileSync(path, content);
