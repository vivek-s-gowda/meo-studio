import { DataSource, DataSourceField } from '../types';

export function inferSchema(data: any[]): DataSourceField[] {
  if (!Array.isArray(data) || data.length === 0) return [];
  const sample = data[0];
  if (typeof sample !== 'object' || sample === null) {
    return [{ name: 'value', type: typeof sample as any, sampleValue: sample }];
  }

  return Object.keys(sample).map((key) => {
    const val = sample[key];
    let type: DataSourceField['type'] = 'string';
    if (typeof val === 'number') type = 'number';
    else if (typeof val === 'boolean') type = 'boolean';
    else if (Array.isArray(val)) type = 'array';
    else if (typeof val === 'object' && val !== null) type = 'object';

    return {
      name: key,
      type,
      sampleValue: val,
    };
  });
}

export function interpolateTokens(template: string, record: Record<string, any>): string {
  if (!template || typeof template !== 'string') return template;
  return template.replace(/\{\{\s*(?:item\.)?([a-zA-Z0-9_.]+)\s*\}\}/g, (_, path) => {
    const parts = path.split('.');
    let cur = record;
    for (const p of parts) {
      if (cur == null) return '';
      cur = cur[p];
    }
    return cur !== undefined ? String(cur) : '';
  });
}

export const PRESET_DATA_SOURCES: DataSource[] = [
  {
    id: 'ds-users',
    name: 'Users Directory API',
    type: 'rest',
    endpoint: 'https://jsonplaceholder.typicode.com/users',
    method: 'GET',
    data: [
      {
        id: 1,
        name: 'Alex Rivera',
        email: 'alex.rivera@example.com',
        role: 'Lead UI Architect',
        department: 'Design Engineering',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        projects: 14,
        rating: 4.9,
      },
      {
        id: 2,
        name: 'Sarah Chen',
        email: 'sarah.chen@example.com',
        role: 'Principal Frontend Dev',
        department: 'Engineering',
        status: 'Online',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        projects: 22,
        rating: 5.0,
      },
      {
        id: 3,
        name: 'Marcus Vance',
        email: 'marcus.v@example.com',
        role: 'Cloud Infrastructure Lead',
        department: 'DevOps',
        status: 'In Meeting',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        projects: 9,
        rating: 4.8,
      },
      {
        id: 4,
        name: 'Elena Rostova',
        email: 'elena.r@example.com',
        role: 'Product Strategist',
        department: 'Product',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        projects: 18,
        rating: 4.95,
      },
      {
        id: 5,
        name: 'David Kim',
        email: 'david.kim@example.com',
        role: 'Security Engineer',
        department: 'InfoSec',
        status: 'Offline',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        projects: 7,
        rating: 4.7,
      },
    ],
    schema: [
      { name: 'id', type: 'number', sampleValue: 1 },
      { name: 'name', type: 'string', sampleValue: 'Alex Rivera' },
      { name: 'email', type: 'string', sampleValue: 'alex.rivera@example.com' },
      { name: 'role', type: 'string', sampleValue: 'Lead UI Architect' },
      { name: 'department', type: 'string', sampleValue: 'Design Engineering' },
      { name: 'status', type: 'string', sampleValue: 'Active' },
      { name: 'avatar', type: 'string', sampleValue: 'https://...' },
      { name: 'projects', type: 'number', sampleValue: 14 },
      { name: 'rating', type: 'number', sampleValue: 4.9 },
    ],
    lastFetched: Date.now(),
  },
  {
    id: 'ds-products',
    name: 'Products Catalog',
    type: 'mock',
    data: [
      {
        id: 101,
        name: 'Wireless ANC Headphones',
        category: 'Audio',
        price: '$299.00',
        rating: 4.8,
        stock: 45,
        badge: 'Best Seller',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80',
      },
      {
        id: 102,
        name: 'Ergonomic Mechanical Keyboard',
        category: 'Peripherals',
        price: '$149.50',
        rating: 4.9,
        stock: 28,
        badge: 'New',
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80',
      },
      {
        id: 103,
        name: '4K Ultra-Wide Monitor 34"',
        category: 'Displays',
        price: '$599.99',
        rating: 4.7,
        stock: 14,
        badge: 'Sale',
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80',
      },
      {
        id: 104,
        name: 'Smart Ambient Desk Lamp',
        category: 'Workspace',
        price: '$79.00',
        rating: 4.6,
        stock: 82,
        badge: 'Trending',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80',
      },
    ],
    schema: [
      { name: 'id', type: 'number', sampleValue: 101 },
      { name: 'name', type: 'string', sampleValue: 'Wireless ANC Headphones' },
      { name: 'category', type: 'string', sampleValue: 'Audio' },
      { name: 'price', type: 'string', sampleValue: '$299.00' },
      { name: 'rating', type: 'number', sampleValue: 4.8 },
      { name: 'stock', type: 'number', sampleValue: 45 },
      { name: 'badge', type: 'string', sampleValue: 'Best Seller' },
      { name: 'image', type: 'string', sampleValue: 'https://...' },
    ],
    lastFetched: Date.now(),
  },
  {
    id: 'ds-tasks',
    name: 'Kanban Sprint Tasks',
    type: 'mock',
    data: [
      {
        id: 201,
        title: 'Design Material 3 Token System',
        priority: 'High',
        status: 'In Progress',
        assignee: 'Alex Rivera',
        dueDate: 'Tomorrow',
      },
      {
        id: 202,
        title: 'Implement Multi-Screen Routing Exporter',
        priority: 'Urgent',
        status: 'Completed',
        assignee: 'Sarah Chen',
        dueDate: 'Today',
      },
      {
        id: 203,
        title: 'Add REST API Data Binding Engine',
        priority: 'High',
        status: 'In Progress',
        assignee: 'Marcus Vance',
        dueDate: 'Nov 18',
      },
      {
        id: 204,
        title: 'End-to-End Cypress Scaffolding Tests',
        priority: 'Medium',
        status: 'Todo',
        assignee: 'David Kim',
        dueDate: 'Nov 21',
      },
      {
        id: 205,
        title: 'Publish Angular 17 Standalone Templates',
        priority: 'Low',
        status: 'Todo',
        assignee: 'Elena Rostova',
        dueDate: 'Nov 24',
      },
    ],
    schema: [
      { name: 'id', type: 'number', sampleValue: 201 },
      { name: 'title', type: 'string', sampleValue: 'Design Material 3 Token System' },
      { name: 'priority', type: 'string', sampleValue: 'High' },
      { name: 'status', type: 'string', sampleValue: 'In Progress' },
      { name: 'assignee', type: 'string', sampleValue: 'Alex Rivera' },
      { name: 'dueDate', type: 'string', sampleValue: 'Tomorrow' },
    ],
    lastFetched: Date.now(),
  },
];
