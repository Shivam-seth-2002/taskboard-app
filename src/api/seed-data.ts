import type { Project, Task, TeamMember } from '../types';
import { generateId } from '../utils/filters';

/**
 * Pre-seeded team members.
 */
export const TEAM_MEMBERS: TeamMember[] = [
  { id: 'tm-1', name: 'Alice Johnson', email: 'alice@company.com', role: 'Frontend Developer' },
  { id: 'tm-2', name: 'Bob Williams', email: 'bob@company.com', role: 'Backend Developer' },
  { id: 'tm-3', name: 'Carol Davis', email: 'carol@company.com', role: 'UI/UX Designer' },
  { id: 'tm-4', name: 'David Miller', email: 'david@company.com', role: 'Project Manager' },
  { id: 'tm-5', name: 'Eva Chen', email: 'eva@company.com', role: 'QA Engineer' },
  { id: 'tm-6', name: 'Frank Brown', email: 'frank@company.com', role: 'DevOps Engineer' },
  { id: 'tm-7', name: 'Grace Kim', email: 'grace@company.com', role: 'Full Stack Developer' },
  { id: 'tm-8', name: 'Henry Taylor', email: 'henry@company.com', role: 'Tech Lead' },
];

function randomDate(startDaysAgo: number, endDaysFromNow: number): string {
  const now = Date.now();
  const start = now - startDaysAgo * 86400000;
  const end = now + endDaysFromNow * 86400000;
  return new Date(start + Math.random() * (end - start)).toISOString();
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate seed projects.
 */
export function generateSeedProjects(): Project[] {
  return [
    {
      id: 'proj-1',
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website with modern UI/UX, improved performance, and mobile-first responsive design.',
      owner: 'Henry Taylor',
      status: 'active',
      dueDate: randomDate(-10, 60),
      createdAt: randomDate(90, -80),
      updatedAt: new Date().toISOString(),
      teamMemberIds: ['tm-1', 'tm-3', 'tm-4', 'tm-7'],
    },
    {
      id: 'proj-2',
      name: 'Mobile App Development',
      description: 'Build a cross-platform mobile application for customer engagement with real-time notifications and offline support.',
      owner: 'David Miller',
      status: 'active',
      dueDate: randomDate(-5, 90),
      createdAt: randomDate(60, -50),
      updatedAt: randomDate(2, 0),
      teamMemberIds: ['tm-1', 'tm-2', 'tm-5', 'tm-7'],
    },
    {
      id: 'proj-3',
      name: 'API Gateway Migration',
      description: 'Migrate the legacy API gateway to a modern microservices architecture with improved scalability and monitoring.',
      owner: 'Frank Brown',
      status: 'active',
      dueDate: randomDate(-3, 45),
      createdAt: randomDate(45, -30),
      updatedAt: randomDate(1, 0),
      teamMemberIds: ['tm-2', 'tm-6', 'tm-8'],
    },
    {
      id: 'proj-4',
      name: 'Q3 Marketing Campaign',
      description: 'Plan and execute the Q3 digital marketing campaign including landing pages, email sequences, and analytics dashboard.',
      owner: 'Carol Davis',
      status: 'completed',
      dueDate: randomDate(30, -20),
      createdAt: randomDate(120, -100),
      updatedAt: randomDate(10, -5),
      teamMemberIds: ['tm-3', 'tm-4'],
    },
    {
      id: 'proj-5',
      name: 'Performance Testing Suite',
      description: 'A comprehensive performance testing project containing 1,000+ tasks for load testing, stress testing, and benchmarking across all services.',
      owner: 'Eva Chen',
      status: 'active',
      dueDate: randomDate(-5, 120),
      createdAt: randomDate(30, -20),
      updatedAt: new Date().toISOString(),
      teamMemberIds: ['tm-1', 'tm-2', 'tm-5', 'tm-6', 'tm-7', 'tm-8'],
    },
    {
      id: 'proj-6',
      name: 'Internal Tools Dashboard',
      description: 'Build an internal dashboard for monitoring CI/CD pipelines, deployment status, and team productivity metrics.',
      owner: 'Alice Johnson',
      status: 'on-hold',
      dueDate: randomDate(-10, 30),
      createdAt: randomDate(60, -40),
      updatedAt: randomDate(15, -10),
      teamMemberIds: ['tm-1', 'tm-6', 'tm-8'],
    },
  ];
}

const TASK_TITLES = [
  'Set up project repository', 'Configure CI/CD pipeline', 'Design database schema',
  'Create API endpoints', 'Implement user authentication', 'Build navigation component',
  'Design responsive layout', 'Write unit tests', 'Set up monitoring',
  'Implement search functionality', 'Create notification system', 'Optimize database queries',
  'Add error handling', 'Implement caching layer', 'Create documentation',
  'Design onboarding flow', 'Build settings page', 'Implement file upload',
  'Create analytics dashboard', 'Set up staging environment', 'Write integration tests',
  'Implement rate limiting', 'Add data export feature', 'Build admin panel',
  'Optimize bundle size', 'Create component library', 'Implement WebSocket support',
  'Design email templates', 'Build feedback widget', 'Set up log aggregation',
  'Implement pagination', 'Create user profile page', 'Add keyboard shortcuts',
  'Build data visualization', 'Implement dark mode', 'Create backup system',
  'Design error pages', 'Build comment system', 'Implement undo/redo',
  'Set up performance monitoring', 'Create migration scripts', 'Build report generator',
  'Implement lazy loading', 'Add accessibility audit', 'Create test fixtures',
  'Build deployment scripts', 'Implement retry logic', 'Design loading states',
  'Create health check endpoint', 'Build task scheduler',
];

const TASK_DESCRIPTIONS = [
  'Implement the feature according to the design specifications and ensure all edge cases are handled.',
  'Review the existing implementation, identify bottlenecks, and propose performance improvements.',
  'Create comprehensive documentation including API references, usage examples, and troubleshooting guide.',
  'Write automated tests covering happy paths, edge cases, and error scenarios.',
  'Set up the infrastructure and configure all necessary services for the deployment.',
  'Design and implement the user interface following the design system guidelines.',
  'Investigate the reported issue, identify the root cause, and implement a fix.',
  'Research best practices and propose an implementation approach for the team review.',
  'Refactor the existing codebase to improve maintainability and reduce technical debt.',
  'Integrate with the third-party service and handle authentication, rate limiting, and error cases.',
];

/**
 * Generate seed tasks for non-performance projects (10-20 tasks each).
 */
function generateProjectTasks(projectId: string, memberIds: string[], count: number): Task[] {
  const statuses: Array<'todo' | 'in-progress' | 'completed'> = ['todo', 'in-progress', 'completed'];
  const priorities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
  const tasks: Task[] = [];

  for (let i = 0; i < count; i++) {
    const createdAt = randomDate(30, -5);
    tasks.push({
      id: generateId() + '-' + i,
      projectId,
      title: TASK_TITLES[i % TASK_TITLES.length] + (i >= TASK_TITLES.length ? ` (${Math.floor(i / TASK_TITLES.length) + 1})` : ''),
      description: randomPick(TASK_DESCRIPTIONS),
      status: randomPick(statuses),
      priority: randomPick(priorities),
      assigneeId: Math.random() > 0.15 ? randomPick(memberIds) : null,
      dueDate: randomDate(-5, 30),
      createdAt,
      updatedAt: randomDate(5, 0),
    });
  }

  return tasks;
}

/**
 * Generate 1,000 tasks for the performance testing project (proj-5).
 */
function generatePerformanceTasks(): Task[] {
  const memberIds = ['tm-1', 'tm-2', 'tm-5', 'tm-6', 'tm-7', 'tm-8'];
  const statuses: Array<'todo' | 'in-progress' | 'completed'> = ['todo', 'in-progress', 'completed'];
  const priorities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
  const tasks: Task[] = [];

  const categories = [
    'Load Test', 'Stress Test', 'Benchmark', 'Integration Test',
    'Regression Test', 'Smoke Test', 'API Test', 'UI Test',
    'Security Scan', 'Performance Audit',
  ];

  const modules = [
    'Auth Service', 'User Service', 'Payment Gateway', 'Notification Service',
    'Search Engine', 'File Storage', 'Analytics Pipeline', 'Message Queue',
    'Cache Layer', 'Database Cluster', 'CDN Configuration', 'API Gateway',
    'Load Balancer', 'Logging Service', 'Monitoring Dashboard',
  ];

  for (let i = 0; i < 1000; i++) {
    const category = categories[i % categories.length];
    const module = modules[i % modules.length];
    const createdAt = randomDate(20, -3);

    tasks.push({
      id: `perf-task-${i}`,
      projectId: 'proj-5',
      title: `${category}: ${module} #${i + 1}`,
      description: `Execute ${category.toLowerCase()} for the ${module.toLowerCase()} component. Verify response times, throughput, and resource utilization under expected and peak load conditions. Document results and flag any performance regressions.`,
      status: randomPick(statuses),
      priority: randomPick(priorities),
      assigneeId: Math.random() > 0.1 ? randomPick(memberIds) : null,
      dueDate: randomDate(-10, 60),
      createdAt,
      updatedAt: randomDate(3, 0),
    });
  }

  return tasks;
}

/**
 * Generate all seed tasks.
 */
export function generateSeedTasks(): Task[] {
  const projects = generateSeedProjects();
  let allTasks: Task[] = [];

  for (const project of projects) {
    if (project.id === 'proj-5') {
      allTasks = allTasks.concat(generatePerformanceTasks());
    } else {
      const count = project.status === 'completed' ? 8 : 12 + Math.floor(Math.random() * 8);
      allTasks = allTasks.concat(generateProjectTasks(project.id, project.teamMemberIds, count));
    }
  }

  return allTasks;
}
