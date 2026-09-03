// Frontend Types for Smart Factory System

export type UserRole = 'Admin' | 'Manager' | 'Supervisor' | 'Employee';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  status: 'Active' | 'Inactive';
  lastLogin: string | null;
  phone?: string;
  createdAt: string;
}

export interface ProductionLine {
  id: string;
  lineId: string;
  name: string;
  description: string;
  location: string;
  status: 'Running' | 'Stopped' | 'Maintenance' | 'Idle';
  targetProduction: number;
  actualProduction: number;
  efficiency: number;
  assignedSupervisor: string;
  supervisorEmail: string;
  machineCount: number;
  createdAt: string;
}

export interface Machine {
  id: string;
  machineId: string;
  name: string;
  type: string;
  productionLineId: string;
  productionLineName: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  installationDate: string;
  status: 'Running' | 'Stopped' | 'Maintenance' | 'Idle' | 'Offline';
  currentRuntimeHours: number;
  totalRuntimeHours: number;
  totalDowntimeHours: number;
  lastMaintenance: string;
  nextMaintenance: string;
  currentFault: string | null;
  assignedTechnician: string;
  healthScore: number;
  temperature: number;
  vibration: number;
  rpm: number;
  powerKw: number;
  pressureBar: number;
  efficiency: number;
}

export interface Product {
  id: string;
  productId: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  targetQuantity: number;
  unit: string;
  productionTimeMinutes: number;
  status: 'Active' | 'Discontinued' | 'Draft';
  unitCost: number;
  unitPrice?: number;
  targetCycleTimeSeconds?: number;
  targetDailyQuantity?: number;
  isActive?: boolean;
  totalProduced?: number;
}

export interface ProductionRecord {
  id: string;
  productionId: string;
  productId: string;
  productName: string;
  productionLineId: string;
  productionLineName: string;
  machineId: string;
  machineName: string;
  quantity: number;
  targetQuantity: number;
  scrapQuantity: number;
  productionDate: string;
  startTime: string;
  endTime: string | null;
  operator: string;
  operatorEmail: string;
  supervisor: string;
  status: 'Planned' | 'Running' | 'Completed' | 'Cancelled';
  efficiency: number;
  notes?: string;
}

export interface MachineFault {
  id: string;
  faultId: string;
  machineId: string;
  machineName: string;
  productionLineId: string;
  productionLineName: string;
  faultType: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  startTime: string;
  endTime: string | null;
  downtimeDurationMinutes: number;
  reportedBy: string;
  assignedTechnician: string;
  resolution: string | null;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
}

export interface MaintenanceRecord {
  id: string;
  maintenanceId: string;
  machineId: string;
  machineName: string;
  maintenanceType: 'Preventive' | 'Corrective' | 'Emergency';
  scheduledDate: string;
  startDate: string | null;
  completionDate: string | null;
  technician: string;
  description: string;
  cost: number;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  notes?: string;
  partsReplaced?: string[];
}

export interface InventoryItem {
  id: string;
  itemId: string;
  name: string;
  category: 'Raw Materials' | 'Components' | 'Consumables' | 'Spare Parts' | 'Packaging';
  sku: string;
  unit: string;
  currentQuantity: number;
  minimumQuantity: number;
  maximumQuantity: number;
  supplier: string;
  location: string;
  unitPrice: number;
  lastUpdated: string;
  status: 'Normal' | 'Low Stock' | 'Critical' | 'Out of Stock';
}

export interface InventoryTransaction {
  id: string;
  transactionId: string;
  itemId: string;
  itemName: string;
  type: 'Stock In' | 'Stock Out' | 'Adjustment' | 'Transfer';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  user: string;
  userEmail: string;
  date: string;
  reason: string;
  referenceNumber?: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  role: UserRole;
  productionLineId: string | null;
  productionLineName: string | null;
  shift: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  hireDate: string;
  certifications?: string[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'fault' | 'maintenance' | 'inventory' | 'production' | 'security';
  severity: 'info' | 'warning' | 'error' | 'success';
  targetRoles: UserRole[];
  readBy: string[];
  isRead?: boolean;
  timestamp: string;
  link?: string;
}

export interface AuditLog {
  id: string;
  user: string;
  userEmail: string;
  userRole: string;
  action: string;
  resource: string;
  timestamp: string;
  result: 'Success' | 'Failure' | 'Warning';
  ipAddress: string;
  userAgent: string;
  details?: string;
}

export interface DashboardKPIs {
  totalProduction: number;
  productionToday: number;
  productionThisWeek: number;
  productionThisMonth: number;
  totalMachines: number;
  activeMachines: number;
  stoppedMachines: number;
  maintenanceMachines: number;
  idleMachines: number;
  totalDowntimeHours: number;
  activeFaults: number;
  lowStockItems: number;
  productionEfficiency: number;
  oee: {
    overall: number;
    availability: number;
    performance: number;
    quality: number;
  };
}

export interface RolePermission {
  role: UserRole;
  description: string;
  permissions: string[];
}
