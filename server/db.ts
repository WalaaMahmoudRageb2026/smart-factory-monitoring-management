// Database models & seed data for Smart Factory Management System
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Supervisor' | 'Employee';
  department: string;
  status: 'Active' | 'Inactive';
  lastLogin: string | null;
  passwordHash: string;
  failedLoginAttempts: number;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export interface RolePermission {
  role: 'Admin' | 'Manager' | 'Supervisor' | 'Employee';
  permissions: string[];
  description: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  manager: string;
  employeeCount: number;
  description: string;
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
  healthScore: number; // 0-100%
  temperature: number; // Celsius
  vibration: number; // mm/s
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
  role: 'Admin' | 'Manager' | 'Supervisor' | 'Employee';
  productionLineId: string | null;
  productionLineName: string | null;
  shift: 'Morning (06:00 - 14:00)' | 'Evening (14:00 - 22:00)' | 'Night (22:00 - 06:00)';
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
  targetRoles: ('Admin' | 'Manager' | 'Supervisor' | 'Employee')[];
  readBy: string[]; // user IDs who have read this
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

// In-Memory Database Container
class InMemoryDB {
  public users: User[] = [];
  public rolePermissions: RolePermission[] = [];
  public departments: Department[] = [];
  public productionLines: ProductionLine[] = [];
  public machines: Machine[] = [];
  public products: Product[] = [];
  public productionRecords: ProductionRecord[] = [];
  public machineFaults: MachineFault[] = [];
  public maintenanceRecords: MaintenanceRecord[] = [];
  public inventoryItems: InventoryItem[] = [];
  public inventoryTransactions: InventoryTransaction[] = [];
  public employees: Employee[] = [];
  public notifications: Notification[] = [];
  public auditLogs: AuditLog[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Generate standard password hashes
    const adminHash = bcrypt.hashSync('FactoryAdmin2026!', 10);
    const mgrHash = bcrypt.hashSync('FactoryMgr2026!', 10);
    const supHash = bcrypt.hashSync('FactorySup2026!', 10);
    const opHash = bcrypt.hashSync('Operator2026!', 10);

    // Users
    this.users = [
      {
        id: 'usr-1',
        email: 'admin@smartfactory.io',
        name: 'Alexander Vance',
        role: 'Admin',
        department: 'Plant Operations & IT',
        status: 'Active',
        lastLogin: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        passwordHash: adminHash,
        failedLoginAttempts: 0,
        phone: '+1 (555) 234-8901',
        createdAt: '2025-01-10T08:00:00Z',
      },
      {
        id: 'usr-2',
        email: 'manager@smartfactory.io',
        name: 'Sarah Sterling',
        role: 'Manager',
        department: 'Operations Management',
        status: 'Active',
        lastLogin: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        passwordHash: mgrHash,
        failedLoginAttempts: 0,
        phone: '+1 (555) 345-9012',
        createdAt: '2025-01-15T09:00:00Z',
      },
      {
        id: 'usr-3',
        email: 'supervisor@smartfactory.io',
        name: 'Marcus Thorne',
        role: 'Supervisor',
        department: 'Machining & Assembly',
        status: 'Active',
        lastLogin: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        passwordHash: supHash,
        failedLoginAttempts: 0,
        phone: '+1 (555) 456-0123',
        createdAt: '2025-02-01T10:00:00Z',
      },
      {
        id: 'usr-4',
        email: 'operator@smartfactory.io',
        name: 'Elena Rostova',
        role: 'Employee',
        department: 'Assembly Line A',
        status: 'Active',
        lastLogin: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
        passwordHash: opHash,
        failedLoginAttempts: 0,
        phone: '+1 (555) 567-1234',
        createdAt: '2025-02-10T11:00:00Z',
      }
    ];

    // Role Permissions
    this.rolePermissions = [
      {
        role: 'Admin',
        description: 'Complete unrestricted access across all modules, configuration, user roles, security, and audit logs.',
        permissions: [
          'users.manage', 'roles.manage', 'employees.manage', 'machines.manage', 
          'lines.manage', 'products.manage', 'inventory.manage', 'maintenance.manage', 
          'faults.manage', 'production.manage', 'reports.view', 'reports.export', 
          'audit.view', 'settings.manage'
        ]
      },
      {
        role: 'Manager',
        description: 'Plant operations oversight, production analytics, machine status tracking, inventory reviews, and executive reporting.',
        permissions: [
          'employees.view', 'machines.view', 'lines.view', 'products.view', 
          'inventory.view', 'inventory.manage', 'maintenance.view', 'faults.view', 
          'production.view', 'reports.view', 'reports.export', 'notifications.view'
        ]
      },
      {
        role: 'Supervisor',
        description: 'Production line execution, operator supervision, batch management, machine fault logging, and shift reporting.',
        permissions: [
          'lines.view', 'machines.view', 'machines.status_update', 'production.manage', 
          'production.view', 'faults.manage', 'inventory.view', 'employees.view', 
          'reports.view', 'notifications.view'
        ]
      },
      {
        role: 'Employee',
        description: 'Machine operation, unit completion logging, defect reporting, and personal shift info.',
        permissions: [
          'lines.view', 'machines.view', 'production.record', 'faults.report', 
          'notifications.view'
        ]
      }
    ];

    // Departments
    this.departments = [
      { id: 'dept-1', name: 'Assembly & Integration', code: 'ASY-01', manager: 'Marcus Thorne', employeeCount: 24, description: 'Automated and manual electro-mechanical assembly operations.' },
      { id: 'dept-2', name: 'Precision CNC Machining', code: 'CNC-02', manager: 'David Chen', employeeCount: 18, description: '5-axis milling, turning, and high-tolerance grinding.' },
      { id: 'dept-3', name: 'Quality Control & Metrology', code: 'QC-03', manager: 'Jessica Alba', employeeCount: 12, description: 'CMM inspection, laser scanning, and batch stress verification.' },
      { id: 'dept-4', name: 'Plant Maintenance & Robotics', code: 'MNT-04', manager: 'Frank Kowalski', employeeCount: 14, description: 'Hydraulics, PLC diagnostics, pneumatics, and predictive maintenance.' },
      { id: 'dept-5', name: 'Logistics & Warehouse', code: 'LOG-05', manager: 'Carlos Gomez', employeeCount: 16, description: 'Raw materials staging, bin replenishment, and finished product packaging.' }
    ];

    // Production Lines
    this.productionLines = [
      {
        id: 'line-1',
        lineId: 'LINE-A01',
        name: 'Line A - High-Speed Automotive Assembly',
        description: 'Automated assembly cell for hybrid drivetrain control units and smart harness modules.',
        location: 'Bay 1, North Sector',
        status: 'Running',
        targetProduction: 2400,
        actualProduction: 2180,
        efficiency: 90.8,
        assignedSupervisor: 'Marcus Thorne',
        supervisorEmail: 'supervisor@smartfactory.io',
        machineCount: 4,
        createdAt: '2024-03-15T00:00:00Z'
      },
      {
        id: 'line-2',
        lineId: 'LINE-B02',
        name: 'Line B - Electronics SMT & Soldering',
        description: 'Surface Mount Technology line for high-density sensor PCBs and microcontroller units.',
        location: 'Bay 2, Cleanroom Alpha',
        status: 'Running',
        targetProduction: 5000,
        actualProduction: 4820,
        efficiency: 96.4,
        assignedSupervisor: 'Sarah Sterling',
        supervisorEmail: 'manager@smartfactory.io',
        machineCount: 3,
        createdAt: '2024-04-10T00:00:00Z'
      },
      {
        id: 'line-3',
        lineId: 'LINE-C03',
        name: 'Line C - Heavy CNC Gear Fabrication',
        description: 'Multi-axis CNC turning and hobbing cell for titanium gear shafts and planetary hubs.',
        location: 'Bay 3, Heavy Machining Wing',
        status: 'Maintenance',
        targetProduction: 1200,
        actualProduction: 840,
        efficiency: 70.0,
        assignedSupervisor: 'David Chen',
        supervisorEmail: 'david.chen@smartfactory.io',
        machineCount: 3,
        createdAt: '2024-05-20T00:00:00Z'
      },
      {
        id: 'line-4',
        lineId: 'LINE-D04',
        name: 'Line D - Precision Laser Cutting & Welding',
        description: 'Fiber laser precision sheet cutting and robotic seam welding for chassis battery packs.',
        location: 'Bay 4, West Annex',
        status: 'Running',
        targetProduction: 1800,
        actualProduction: 1690,
        efficiency: 93.8,
        assignedSupervisor: 'Marcus Thorne',
        supervisorEmail: 'supervisor@smartfactory.io',
        machineCount: 2,
        createdAt: '2024-06-05T00:00:00Z'
      },
      {
        id: 'line-5',
        lineId: 'LINE-E05',
        name: 'Line E - Final Quality & Automated Packaging',
        description: 'Automated visual inspection, barcode scanning, foam cushioning, and palletizing robots.',
        location: 'Bay 5, Dispatch Zone',
        status: 'Idle',
        targetProduction: 3000,
        actualProduction: 2850,
        efficiency: 95.0,
        assignedSupervisor: 'Carlos Gomez',
        supervisorEmail: 'carlos.g@smartfactory.io',
        machineCount: 2,
        createdAt: '2024-08-01T00:00:00Z'
      }
    ];

    // Machines
    this.machines = [
      {
        id: 'mch-1',
        machineId: 'MCH-101',
        name: 'Robotic Pick & Place System Alpha',
        type: 'Automated Assembly Robot',
        productionLineId: 'line-1',
        productionLineName: 'Line A - High-Speed Automotive Assembly',
        manufacturer: 'KUKA Robotics Inc.',
        model: 'KR 600 FORTEC Industrial',
        serialNumber: 'KR-2024-8849-01',
        installationDate: '2024-03-20',
        status: 'Running',
        currentRuntimeHours: 342.5,
        totalRuntimeHours: 4890,
        totalDowntimeHours: 76.2,
        lastMaintenance: '2026-08-10',
        nextMaintenance: '2026-09-10',
        currentFault: null,
        assignedTechnician: 'Frank Kowalski',
        healthScore: 97,
        temperature: 42.8,
        vibration: 1.4,
        rpm: 1450,
        powerKw: 18.5,
        pressureBar: 6.2,
        efficiency: 95.2
      },
      {
        id: 'mch-2',
        machineId: 'MCH-102',
        name: 'Rotary Indexing Dial Assembly Station',
        type: 'Rotary Dial Machine',
        productionLineId: 'line-1',
        productionLineName: 'Line A - High-Speed Automotive Assembly',
        manufacturer: 'Mikron Automation',
        model: 'G05 High Precision Platform',
        serialNumber: 'MK-9023-412',
        installationDate: '2024-03-22',
        status: 'Running',
        currentRuntimeHours: 280.1,
        totalRuntimeHours: 4620,
        totalDowntimeHours: 84.0,
        lastMaintenance: '2026-08-05',
        nextMaintenance: '2026-09-05',
        currentFault: null,
        assignedTechnician: 'Frank Kowalski',
        healthScore: 94,
        temperature: 48.1,
        vibration: 2.1,
        rpm: 980,
        powerKw: 12.0,
        pressureBar: 6.0,
        efficiency: 92.4
      },
      {
        id: 'mch-3',
        machineId: 'MCH-103',
        name: 'Automated Optical Inspection (AOI)',
        type: 'Vision Inspection System',
        productionLineId: 'line-1',
        productionLineName: 'Line A - High-Speed Automotive Assembly',
        manufacturer: 'Koh Young Technology',
        model: 'Zenith 3D AOI System',
        serialNumber: 'KY-3D-5510',
        installationDate: '2024-03-25',
        status: 'Running',
        currentRuntimeHours: 350.0,
        totalRuntimeHours: 4950,
        totalDowntimeHours: 42.1,
        lastMaintenance: '2026-08-12',
        nextMaintenance: '2026-09-12',
        currentFault: null,
        assignedTechnician: 'Jessica Alba',
        healthScore: 98,
        temperature: 36.5,
        vibration: 0.6,
        rpm: 0,
        powerKw: 4.8,
        pressureBar: 5.5,
        efficiency: 98.6
      },
      {
        id: 'mch-4',
        machineId: 'MCH-104',
        name: 'High-Speed SMT Placement Robot',
        type: 'SMT Chip Mounter',
        productionLineId: 'line-2',
        productionLineName: 'Line B - Electronics SMT & Soldering',
        manufacturer: 'ASM Assembly Systems',
        model: 'SIPLACE TX 2x Micron',
        serialNumber: 'SIP-TX-77821',
        installationDate: '2024-04-15',
        status: 'Running',
        currentRuntimeHours: 410.2,
        totalRuntimeHours: 5120,
        totalDowntimeHours: 38.5,
        lastMaintenance: '2026-08-15',
        nextMaintenance: '2026-09-15',
        currentFault: null,
        assignedTechnician: 'Frank Kowalski',
        healthScore: 96,
        temperature: 39.2,
        vibration: 1.1,
        rpm: 2800,
        powerKw: 15.2,
        pressureBar: 6.5,
        efficiency: 97.1
      },
      {
        id: 'mch-5',
        machineId: 'MCH-105',
        name: '10-Zone Nitrogen Reflow Oven',
        type: 'Reflow Soldering Oven',
        productionLineId: 'line-2',
        productionLineName: 'Line B - Electronics SMT & Soldering',
        manufacturer: 'Heller Industries',
        model: '1913 MK5 High Flux Solder',
        serialNumber: 'HL-MK5-1913',
        installationDate: '2024-04-18',
        status: 'Stopped',
        currentRuntimeHours: 0.0,
        totalRuntimeHours: 4780,
        totalDowntimeHours: 112.4,
        lastMaintenance: '2026-07-28',
        nextMaintenance: '2026-08-28',
        currentFault: 'Zone 4 Heating Element Temp Fluctuation',
        assignedTechnician: 'Frank Kowalski',
        healthScore: 68,
        temperature: 245.0,
        vibration: 0.8,
        rpm: 450,
        powerKw: 32.0,
        pressureBar: 4.8,
        efficiency: 64.0
      },
      {
        id: 'mch-6',
        machineId: 'MCH-106',
        name: '5-Axis Heavy CNC Machining Center',
        type: 'CNC Milling Center',
        productionLineId: 'line-3',
        productionLineName: 'Line C - Heavy CNC Gear Fabrication',
        manufacturer: 'DMG MORI AG',
        model: 'DMU 75 monoBLOCK',
        serialNumber: 'DMG-75MB-3301',
        installationDate: '2024-05-25',
        status: 'Maintenance',
        currentRuntimeHours: 0.0,
        totalRuntimeHours: 3920,
        totalDowntimeHours: 198.6,
        lastMaintenance: '2026-08-24',
        nextMaintenance: '2026-09-24',
        currentFault: 'Spindle Bearing Vibration Anomaly',
        assignedTechnician: 'David Chen',
        healthScore: 62,
        temperature: 55.4,
        vibration: 4.8,
        rpm: 0,
        powerKw: 2.1,
        pressureBar: 7.2,
        efficiency: 61.5
      },
      {
        id: 'mch-7',
        machineId: 'MCH-107',
        name: 'CNC Gear Hobbing & Shaping Cell',
        type: 'Gear Hobbing Machine',
        productionLineId: 'line-3',
        productionLineName: 'Line C - Heavy CNC Gear Fabrication',
        manufacturer: 'Gleason Corporation',
        model: 'Genesis 210H Hobbing Center',
        serialNumber: 'GLS-210H-882',
        installationDate: '2024-05-28',
        status: 'Running',
        currentRuntimeHours: 190.4,
        totalRuntimeHours: 3650,
        totalDowntimeHours: 145.0,
        lastMaintenance: '2026-08-01',
        nextMaintenance: '2026-09-01',
        currentFault: null,
        assignedTechnician: 'David Chen',
        healthScore: 89,
        temperature: 46.2,
        vibration: 2.3,
        rpm: 1200,
        powerKw: 24.5,
        pressureBar: 6.8,
        efficiency: 88.0
      },
      {
        id: 'mch-8',
        machineId: 'MCH-108',
        name: 'Fiber Laser Cutting Gantry 12kW',
        type: 'Laser Cutting System',
        productionLineId: 'line-4',
        productionLineName: 'Line D - Precision Laser Cutting & Welding',
        manufacturer: 'Trumpf GmbH',
        model: 'TruLaser 5030 Fiber',
        serialNumber: 'TRU-5030-9941',
        installationDate: '2024-06-10',
        status: 'Running',
        currentRuntimeHours: 320.0,
        totalRuntimeHours: 4100,
        totalDowntimeHours: 65.0,
        lastMaintenance: '2026-08-08',
        nextMaintenance: '2026-09-08',
        currentFault: null,
        assignedTechnician: 'Marcus Thorne',
        healthScore: 95,
        temperature: 31.0,
        vibration: 0.9,
        rpm: 0,
        powerKw: 28.0,
        pressureBar: 18.5,
        efficiency: 94.5
      },
      {
        id: 'mch-9',
        machineId: 'MCH-109',
        name: 'Robotic Seam Welding Workcell',
        type: 'Laser/MIG Welding Robot',
        productionLineId: 'line-4',
        productionLineName: 'Line D - Precision Laser Cutting & Welding',
        manufacturer: 'FANUC Corporation',
        model: 'ARC Mate 120iD/35',
        serialNumber: 'FAN-ARC-120-72',
        installationDate: '2024-06-15',
        status: 'Running',
        currentRuntimeHours: 315.6,
        totalRuntimeHours: 4050,
        totalDowntimeHours: 72.3,
        lastMaintenance: '2026-08-09',
        nextMaintenance: '2026-09-09',
        currentFault: null,
        assignedTechnician: 'Marcus Thorne',
        healthScore: 93,
        temperature: 44.0,
        vibration: 1.8,
        rpm: 0,
        powerKw: 21.0,
        pressureBar: 5.8,
        efficiency: 92.8
      },
      {
        id: 'mch-10',
        machineId: 'MCH-110',
        name: 'High-Density Automated Palletizer',
        type: 'Palletizing Robot',
        productionLineId: 'line-5',
        productionLineName: 'Line E - Final Quality & Automated Packaging',
        manufacturer: 'ABB Robotics',
        model: 'IRB 660 High-Capacity',
        serialNumber: 'ABB-660-55410',
        installationDate: '2024-08-05',
        status: 'Idle',
        currentRuntimeHours: 140.0,
        totalRuntimeHours: 2900,
        totalDowntimeHours: 32.0,
        lastMaintenance: '2026-08-14',
        nextMaintenance: '2026-09-14',
        currentFault: null,
        assignedTechnician: 'Carlos Gomez',
        healthScore: 96,
        temperature: 33.2,
        vibration: 0.7,
        rpm: 600,
        powerKw: 11.2,
        pressureBar: 6.0,
        efficiency: 95.0
      },
      {
        id: 'mch-11',
        machineId: 'MCH-111',
        name: 'Automatic Case Erector & Tape Sealer',
        type: 'Packaging Machine',
        productionLineId: 'line-5',
        productionLineName: 'Line E - Final Quality & Automated Packaging',
        manufacturer: 'Combi Packaging Systems',
        model: '2-EZ HS Ergopack',
        serialNumber: 'CMB-2EZ-1102',
        installationDate: '2024-08-08',
        status: 'Idle',
        currentRuntimeHours: 125.0,
        totalRuntimeHours: 2750,
        totalDowntimeHours: 41.5,
        lastMaintenance: '2026-08-14',
        nextMaintenance: '2026-09-14',
        currentFault: null,
        assignedTechnician: 'Carlos Gomez',
        healthScore: 92,
        temperature: 30.5,
        vibration: 1.2,
        rpm: 450,
        powerKw: 6.5,
        pressureBar: 5.5,
        efficiency: 93.0
      },
      {
        id: 'mch-12',
        machineId: 'MCH-112',
        name: 'Hydraulic Deep Draw Press 500T',
        type: 'Hydraulic Press',
        productionLineId: 'line-1',
        productionLineName: 'Line A - High-Speed Automotive Assembly',
        manufacturer: 'Schuler Group AG',
        model: 'HPS 500 Heavy Stamping',
        serialNumber: 'SCH-HPS-500-19',
        installationDate: '2024-03-18',
        status: 'Running',
        currentRuntimeHours: 295.0,
        totalRuntimeHours: 4400,
        totalDowntimeHours: 95.0,
        lastMaintenance: '2026-08-02',
        nextMaintenance: '2026-09-02',
        currentFault: null,
        assignedTechnician: 'Frank Kowalski',
        healthScore: 91,
        temperature: 52.0,
        vibration: 2.8,
        rpm: 0,
        powerKw: 45.0,
        pressureBar: 220.0,
        efficiency: 91.0
      }
    ];

    // Products
    this.products = [
      {
        id: 'prd-1',
        productId: 'PRD-AUTO-01',
        name: 'Automotive ECU Powertrain Controller',
        sku: 'ECU-PWR-902',
        category: 'Automotive Electronics',
        description: '32-bit dual-core electronic control unit for hybrid powertrain inverter management.',
        targetQuantity: 1000,
        unit: 'Units',
        productionTimeMinutes: 4.5,
        status: 'Active',
        unitCost: 145.00
      },
      {
        id: 'prd-2',
        productId: 'PRD-CNC-02',
        name: 'Titanium Planetary Gear Hub Assembly',
        sku: 'GBX-PLN-554',
        category: 'Mechanical Powertrain',
        description: 'Aerospace-grade Ti-6Al-4V machined planetary gear set for heavy-duty torque transfer.',
        targetQuantity: 400,
        unit: 'Sets',
        productionTimeMinutes: 28.0,
        status: 'Active',
        unitCost: 320.00
      },
      {
        id: 'prd-3',
        productId: 'PRD-BAT-03',
        name: 'Structural Lithium Battery Enclosure Tray',
        sku: 'ENC-BAT-770',
        category: 'EV Energy Storage',
        description: 'Laser-welded reinforced aluminum alloy cold-plate battery casing for 800V EV architectures.',
        targetQuantity: 600,
        unit: 'Packs',
        productionTimeMinutes: 18.5,
        status: 'Active',
        unitCost: 280.00
      },
      {
        id: 'prd-4',
        productId: 'PRD-IOT-04',
        name: 'Industrial Vibration Telemetry Sensor Node',
        sku: 'SNS-VIB-108',
        category: 'Industrial IoT',
        description: 'Tri-axial MEMS accelerometer with LoRaWAN wireless telemetry and IP67 sealed housing.',
        targetQuantity: 2500,
        unit: 'Units',
        productionTimeMinutes: 2.2,
        status: 'Active',
        unitCost: 62.50
      },
      {
        id: 'prd-5',
        productId: 'PRD-VAL-05',
        name: 'High-Pressure Proportional Solenoid Valve',
        sku: 'VLV-PRP-332',
        category: 'Fluid Hydraulics',
        description: 'Direct-acting 350-bar proportional cartridge valve with integrated feedback transducer.',
        targetQuantity: 800,
        unit: 'Units',
        productionTimeMinutes: 9.0,
        status: 'Active',
        unitCost: 110.00
      }
    ];

    // Production Records
    this.productionRecords = [
      {
        id: 'rec-1',
        productionId: 'PR-2026-0825-01',
        productId: 'prd-1',
        productName: 'Automotive ECU Powertrain Controller',
        productionLineId: 'line-1',
        productionLineName: 'Line A - High-Speed Automotive Assembly',
        machineId: 'mch-1',
        machineName: 'Robotic Pick & Place System Alpha',
        quantity: 820,
        targetQuantity: 900,
        scrapQuantity: 12,
        productionDate: '2026-08-25',
        startTime: '06:00:00',
        endTime: null,
        operator: 'Elena Rostova',
        operatorEmail: 'operator@smartfactory.io',
        supervisor: 'Marcus Thorne',
        status: 'Running',
        efficiency: 91.1,
        notes: 'Shift running smoothly. Feed rate optimized at 98% nominal.'
      },
      {
        id: 'rec-2',
        productionId: 'PR-2026-0825-02',
        productId: 'prd-4',
        productName: 'Industrial Vibration Telemetry Sensor Node',
        productionLineId: 'line-2',
        productionLineName: 'Line B - Electronics SMT & Soldering',
        machineId: 'mch-4',
        machineName: 'High-Speed SMT Placement Robot',
        quantity: 2150,
        targetQuantity: 2200,
        scrapQuantity: 18,
        productionDate: '2026-08-25',
        startTime: '06:00:00',
        endTime: null,
        operator: 'Michael Chang',
        operatorEmail: 'michael.c@smartfactory.io',
        supervisor: 'Sarah Sterling',
        status: 'Running',
        efficiency: 97.7,
        notes: 'Batch in final testing stage. Solder paste density verified.'
      },
      {
        id: 'rec-3',
        productionId: 'PR-2026-0825-03',
        productId: 'prd-2',
        productName: 'Titanium Planetary Gear Hub Assembly',
        productionLineId: 'line-3',
        productionLineName: 'Line C - Heavy CNC Gear Fabrication',
        machineId: 'mch-6',
        machineName: '5-Axis Heavy CNC Machining Center',
        quantity: 110,
        targetQuantity: 300,
        scrapQuantity: 8,
        productionDate: '2026-08-25',
        startTime: '06:30:00',
        endTime: '11:15:00',
        operator: 'David Chen',
        operatorEmail: 'david.chen@smartfactory.io',
        supervisor: 'David Chen',
        status: 'Cancelled',
        efficiency: 36.6,
        notes: 'Halted due to excessive spindle vibration. Transferred to maintenance queue.'
      },
      {
        id: 'rec-4',
        productionId: 'PR-2026-0825-04',
        productId: 'prd-3',
        productName: 'Structural Lithium Battery Enclosure Tray',
        productionLineId: 'line-4',
        productionLineName: 'Line D - Precision Laser Cutting & Welding',
        machineId: 'mch-8',
        machineName: 'Fiber Laser Cutting Gantry 12kW',
        quantity: 420,
        targetQuantity: 450,
        scrapQuantity: 5,
        productionDate: '2026-08-25',
        startTime: '07:00:00',
        endTime: null,
        operator: 'Marcus Thorne',
        operatorEmail: 'supervisor@smartfactory.io',
        supervisor: 'Marcus Thorne',
        status: 'Running',
        efficiency: 93.3,
        notes: 'Laser optic cleaned prior to run start. Seam integrity nominal.'
      },
      {
        id: 'rec-5',
        productionId: 'PR-2026-0824-01',
        productId: 'prd-1',
        productName: 'Automotive ECU Powertrain Controller',
        productionLineId: 'line-1',
        productionLineName: 'Line A - High-Speed Automotive Assembly',
        machineId: 'mch-1',
        machineName: 'Robotic Pick & Place System Alpha',
        quantity: 1350,
        targetQuantity: 1400,
        scrapQuantity: 15,
        productionDate: '2026-08-24',
        startTime: '06:00:00',
        endTime: '22:00:00',
        operator: 'Elena Rostova',
        operatorEmail: 'operator@smartfactory.io',
        supervisor: 'Marcus Thorne',
        status: 'Completed',
        efficiency: 96.4,
        notes: 'Target completed within shift parameters with zero safety incidents.'
      },
      {
        id: 'rec-6',
        productionId: 'PR-2026-0824-02',
        productId: 'prd-5',
        productName: 'High-Pressure Proportional Solenoid Valve',
        productionLineId: 'line-3',
        productionLineName: 'Line C - Heavy CNC Gear Fabrication',
        machineId: 'mch-7',
        machineName: 'CNC Gear Hobbing & Shaping Cell',
        quantity: 780,
        targetQuantity: 800,
        scrapQuantity: 10,
        productionDate: '2026-08-24',
        startTime: '07:00:00',
        endTime: '19:30:00',
        operator: 'David Chen',
        operatorEmail: 'david.chen@smartfactory.io',
        supervisor: 'David Chen',
        status: 'Completed',
        efficiency: 97.5,
        notes: 'Hydrostatic pressure test passed at 1.5x working limit.'
      }
    ];

    // Machine Faults
    this.machineFaults = [
      {
        id: 'flt-1',
        faultId: 'FLT-2026-0825-01',
        machineId: 'mch-6',
        machineName: '5-Axis Heavy CNC Machining Center',
        productionLineId: 'line-3',
        productionLineName: 'Line C - Heavy CNC Gear Fabrication',
        faultType: 'Mechanical Vibration',
        description: 'Excessive spindle vibration (4.8 mm/s exceeding 2.5 mm/s limit) detected during high-speed roughing pass.',
        severity: 'Critical',
        startTime: '2026-08-25T10:45:00Z',
        endTime: null,
        downtimeDurationMinutes: 435,
        reportedBy: 'David Chen',
        assignedTechnician: 'Frank Kowalski',
        resolution: null,
        status: 'In Progress'
      },
      {
        id: 'flt-2',
        faultId: 'FLT-2026-0825-02',
        machineId: 'mch-5',
        machineName: '10-Zone Nitrogen Reflow Oven',
        productionLineId: 'line-2',
        productionLineName: 'Line B - Electronics SMT & Soldering',
        faultType: 'Thermal Regulator Anomaly',
        description: 'Zone 4 PID thermocouple sensing intermittent ±15°C temperature swings causing auto-shutdown safeguard.',
        severity: 'High',
        startTime: '2026-08-25T08:15:00Z',
        endTime: null,
        downtimeDurationMinutes: 585,
        reportedBy: 'Michael Chang',
        assignedTechnician: 'Frank Kowalski',
        resolution: null,
        status: 'Open'
      },
      {
        id: 'flt-3',
        faultId: 'FLT-2026-0824-01',
        machineId: 'mch-2',
        machineName: 'Rotary Indexing Dial Assembly Station',
        productionLineId: 'line-1',
        productionLineName: 'Line A - High-Speed Automotive Assembly',
        faultType: 'Pneumatic Pressure Drop',
        description: 'Supply pressure dropped below 5.0 bar threshold due to clogged inline moisture separator filter.',
        severity: 'Medium',
        startTime: '2026-08-24T14:20:00Z',
        endTime: '2026-08-24T15:10:00Z',
        downtimeDurationMinutes: 50,
        reportedBy: 'Elena Rostova',
        assignedTechnician: 'Frank Kowalski',
        resolution: 'Replaced saturated particulate filter element, purged manifold, and re-calibrated pressure regulator.',
        status: 'Closed'
      },
      {
        id: 'flt-4',
        faultId: 'FLT-2026-0823-01',
        machineId: 'mch-8',
        machineName: 'Fiber Laser Cutting Gantry 12kW',
        productionLineId: 'line-4',
        productionLineName: 'Line D - Precision Laser Cutting & Welding',
        faultType: 'Optical Focus Calibration',
        description: 'Beam drift alert on Y-axis mirror collimator causing slight kerf width widening on 6mm aluminum.',
        severity: 'Low',
        startTime: '2026-08-23T09:10:00Z',
        endTime: '2026-08-23T09:45:00Z',
        downtimeDurationMinutes: 35,
        reportedBy: 'Marcus Thorne',
        assignedTechnician: 'Marcus Thorne',
        resolution: 'Cleaned protective cover glass, recalibrated motorized focal lens via CNC teach pendant.',
        status: 'Closed'
      }
    ];

    // Maintenance Records
    this.maintenanceRecords = [
      {
        id: 'mnt-1',
        maintenanceId: 'MNT-2026-0824-01',
        machineId: 'mch-6',
        machineName: '5-Axis Heavy CNC Machining Center',
        maintenanceType: 'Emergency',
        scheduledDate: '2026-08-24',
        startDate: '2026-08-24T12:00:00Z',
        completionDate: null,
        technician: 'Frank Kowalski',
        description: 'Complete inspection and bearing replacement of 18,000 RPM HSK-A63 motorized spindle unit.',
        cost: 4200.00,
        status: 'In Progress',
        notes: 'Spindle bearing kit pulled from spare parts stock. Replacement in progress.',
        partsReplaced: ['Spindle Ceramic Bearings B7010-E-T-P4S', 'Rotary Union High-Pressure Seal']
      },
      {
        id: 'mnt-2',
        maintenanceId: 'MNT-2026-0828-01',
        machineId: 'mch-5',
        machineName: '10-Zone Nitrogen Reflow Oven',
        maintenanceType: 'Corrective',
        scheduledDate: '2026-08-28',
        startDate: null,
        completionDate: null,
        technician: 'Frank Kowalski',
        description: 'Thermal couple sensor probe array replacement and SSR (Solid State Relay) bank testing on zones 3-5.',
        cost: 850.00,
        status: 'Scheduled',
        notes: 'Parts staged in maintenance staging locker Bay 2.'
      },
      {
        id: 'mnt-3',
        maintenanceId: 'MNT-2026-0810-01',
        machineId: 'mch-1',
        machineName: 'Robotic Pick & Place System Alpha',
        maintenanceType: 'Preventive',
        scheduledDate: '2026-08-10',
        startDate: '2026-08-10T06:00:00Z',
        completionDate: '2026-08-10T11:30:00Z',
        technician: 'Frank Kowalski',
        description: '5000-Hour scheduled preventive lubrication, harmonic drive gear grease flush, and payload mastering calibration.',
        cost: 1250.00,
        status: 'Completed',
        notes: 'All 6 axes inspected, zero backlash detected. Ready for full rate production.',
        partsReplaced: ['Harmonic Grease Cartridge FG-2', 'Vacuum Suction Cups Nitrile 25mm']
      },
      {
        id: 'mnt-4',
        maintenanceId: 'MNT-2026-0905-01',
        machineId: 'mch-2',
        machineName: 'Rotary Indexing Dial Assembly Station',
        maintenanceType: 'Preventive',
        scheduledDate: '2026-09-05',
        startDate: null,
        completionDate: null,
        technician: 'Frank Kowalski',
        description: 'Quarterly indexer backlash verification, pneumatic cylinder seal pack inspection, and safety curtain test.',
        cost: 600.00,
        status: 'Scheduled',
        notes: 'Requires 4-hour scheduled downtime slot during weekend shift change.'
      }
    ];

    // Inventory Items
    this.inventoryItems = [
      {
        id: 'inv-1',
        itemId: 'INV-IC-101',
        name: 'Automotive 32-Bit Microcontroller Cortex-M7',
        category: 'Components',
        sku: 'MCU-STM32H7-AUT',
        unit: 'Pieces',
        currentQuantity: 1850,
        minimumQuantity: 500,
        maximumQuantity: 5000,
        supplier: 'STMicroelectronics Silicon Fab',
        location: 'Bin A-14-02 (Cleanroom)',
        unitPrice: 18.50,
        lastUpdated: '2026-08-25T08:00:00Z',
        status: 'Normal'
      },
      {
        id: 'inv-2',
        itemId: 'INV-AL-202',
        name: 'Aluminum 6061-T6 Cold Rolled Sheet 4mm',
        category: 'Raw Materials',
        sku: 'RAW-AL6061-4MM',
        unit: 'Sheets',
        currentQuantity: 65,
        minimumQuantity: 80,
        maximumQuantity: 300,
        supplier: 'Arconic Metals Direct',
        location: 'Racks C-01 (North Yard)',
        unitPrice: 95.00,
        lastUpdated: '2026-08-25T07:30:00Z',
        status: 'Low Stock'
      },
      {
        id: 'inv-3',
        itemId: 'INV-TI-303',
        name: 'Titanium Grade 5 Round Bar Ø60mm',
        category: 'Raw Materials',
        sku: 'RAW-TI64-60MM',
        unit: 'Meters',
        currentQuantity: 18,
        minimumQuantity: 50,
        maximumQuantity: 200,
        supplier: 'Carpenter Technology Aerospace',
        location: 'Vault T-02 (Secure Storage)',
        unitPrice: 240.00,
        lastUpdated: '2026-08-25T09:15:00Z',
        status: 'Critical'
      },
      {
        id: 'inv-4',
        itemId: 'INV-SP-404',
        name: 'Spindle Ceramic High-Precision Bearing Kit',
        category: 'Spare Parts',
        sku: 'SPR-BRG-B7010',
        unit: 'Sets',
        currentQuantity: 0,
        minimumQuantity: 2,
        maximumQuantity: 10,
        supplier: 'SKF Industrial Motion',
        location: 'Cabinet M-04-1',
        unitPrice: 1450.00,
        lastUpdated: '2026-08-24T12:00:00Z',
        status: 'Out of Stock'
      },
      {
        id: 'inv-5',
        itemId: 'INV-SL-505',
        name: 'Lead-Free SAC305 Solder Paste Syringe 500g',
        category: 'Consumables',
        sku: 'CNS-SLD-SAC305',
        unit: 'Tubes',
        currentQuantity: 42,
        minimumQuantity: 15,
        maximumQuantity: 100,
        supplier: 'Indium Corporation',
        location: 'Refrigerated Locker R-03',
        unitPrice: 78.00,
        lastUpdated: '2026-08-25T06:00:00Z',
        status: 'Normal'
      },
      {
        id: 'inv-6',
        itemId: 'INV-PKG-606',
        name: 'Anti-Static ESD Corrugated Shipping Boxes',
        category: 'Packaging',
        sku: 'PKG-ESD-BX40',
        unit: 'Cartons',
        currentQuantity: 840,
        minimumQuantity: 200,
        maximumQuantity: 2000,
        supplier: 'Sealed Air Packaging',
        location: 'Warehouse Staging D-09',
        unitPrice: 3.20,
        lastUpdated: '2026-08-23T15:00:00Z',
        status: 'Normal'
      }
    ];

    // Inventory Transactions
    this.inventoryTransactions = [
      {
        id: 'tx-1',
        transactionId: 'TX-2026-0825-01',
        itemId: 'inv-1',
        itemName: 'Automotive 32-Bit Microcontroller Cortex-M7',
        type: 'Stock In',
        quantity: 500,
        previousQuantity: 1350,
        newQuantity: 1850,
        user: 'Alexander Vance',
        userEmail: 'admin@smartfactory.io',
        date: '2026-08-25T08:00:00Z',
        reason: 'Received PO #PO-9921 from STMicroelectronics',
        referenceNumber: 'PO-9921'
      },
      {
        id: 'tx-2',
        transactionId: 'TX-2026-0825-02',
        itemId: 'inv-2',
        itemName: 'Aluminum 6061-T6 Cold Rolled Sheet 4mm',
        type: 'Stock Out',
        quantity: 25,
        previousQuantity: 90,
        newQuantity: 65,
        user: 'Marcus Thorne',
        userEmail: 'supervisor@smartfactory.io',
        date: '2026-08-25T07:30:00Z',
        reason: 'Material requisition for Line D Battery Enclosure batch PR-2026-0825-04',
        referenceNumber: 'REQ-4412'
      },
      {
        id: 'tx-3',
        transactionId: 'TX-2026-0824-01',
        itemId: 'inv-4',
        itemName: 'Spindle Ceramic High-Precision Bearing Kit',
        type: 'Stock Out',
        quantity: 1,
        previousQuantity: 1,
        newQuantity: 0,
        user: 'Frank Kowalski',
        userEmail: 'frank.k@smartfactory.io',
        date: '2026-08-24T12:00:00Z',
        reason: 'Emergency repair on CNC Machine MCH-106 (Ticket MNT-2026-0824-01)',
        referenceNumber: 'MNT-2026-0824-01'
      }
    ];

    // Employees
    this.employees = [
      {
        id: 'emp-1',
        employeeId: 'EMP-1001',
        fullName: 'Alexander Vance',
        email: 'admin@smartfactory.io',
        phone: '+1 (555) 234-8901',
        department: 'Plant Operations & IT',
        position: 'VP of Manufacturing & Smart Systems',
        role: 'Admin',
        productionLineId: null,
        productionLineName: 'All Lines',
        shift: 'Morning (06:00 - 14:00)',
        status: 'Active',
        hireDate: '2020-03-15',
        certifications: ['Six Sigma Black Belt', 'CISSP Security', 'Lean Industrial Architect']
      },
      {
        id: 'emp-2',
        employeeId: 'EMP-1002',
        fullName: 'Sarah Sterling',
        email: 'manager@smartfactory.io',
        phone: '+1 (555) 345-9012',
        department: 'Operations Management',
        position: 'Senior Operations Director',
        role: 'Manager',
        productionLineId: 'line-2',
        productionLineName: 'Line B - Electronics SMT & Soldering',
        shift: 'Morning (06:00 - 14:00)',
        status: 'Active',
        hireDate: '2021-06-01',
        certifications: ['Certified Supply Chain Professional (CSCP)', 'OEE Practitioner']
      },
      {
        id: 'emp-3',
        employeeId: 'EMP-1003',
        fullName: 'Marcus Thorne',
        email: 'supervisor@smartfactory.io',
        phone: '+1 (555) 456-0123',
        department: 'Machining & Assembly',
        position: 'Assembly Cell Production Supervisor',
        role: 'Supervisor',
        productionLineId: 'line-1',
        productionLineName: 'Line A - High-Speed Automotive Assembly',
        shift: 'Morning (06:00 - 14:00)',
        status: 'Active',
        hireDate: '2022-01-15',
        certifications: ['Industrial Robotics Specialist', 'OSHA 30-Hour Safety']
      },
      {
        id: 'emp-4',
        employeeId: 'EMP-1004',
        fullName: 'Elena Rostova',
        email: 'operator@smartfactory.io',
        phone: '+1 (555) 567-1234',
        department: 'Assembly Line A',
        position: 'Senior Lead Line Operator',
        role: 'Employee',
        productionLineId: 'line-1',
        productionLineName: 'Line A - High-Speed Automotive Assembly',
        shift: 'Morning (06:00 - 14:00)',
        status: 'Active',
        hireDate: '2023-04-10',
        certifications: ['IPC-A-610 Soldering Spec', 'KUKA Robot Master Operator']
      },
      {
        id: 'emp-5',
        employeeId: 'EMP-1005',
        fullName: 'Frank Kowalski',
        email: 'frank.k@smartfactory.io',
        phone: '+1 (555) 678-2345',
        department: 'Plant Maintenance & Robotics',
        position: 'Master Industrial Mechatronics Technician',
        role: 'Supervisor',
        productionLineId: null,
        productionLineName: 'Plant-Wide Maintenance',
        shift: 'Morning (06:00 - 14:00)',
        status: 'Active',
        hireDate: '2021-11-20',
        certifications: ['Siemens S7 PLC Certified', 'Vibration Analysis ISO Cat III', 'Hydraulic Systems Specialist']
      },
      {
        id: 'emp-6',
        employeeId: 'EMP-1006',
        fullName: 'David Chen',
        email: 'david.chen@smartfactory.io',
        phone: '+1 (555) 789-3456',
        department: 'Precision CNC Machining',
        position: 'CNC Machining Lead & Tooling Specialist',
        role: 'Supervisor',
        productionLineId: 'line-3',
        productionLineName: 'Line C - Heavy CNC Gear Fabrication',
        shift: 'Evening (14:00 - 22:00)',
        status: 'Active',
        hireDate: '2022-08-01',
        certifications: ['Mastercam Multi-Axis Certified', 'Metrology Level 2']
      },
      {
        id: 'emp-7',
        employeeId: 'EMP-1007',
        fullName: 'Jessica Alba',
        email: 'jessica.a@smartfactory.io',
        phone: '+1 (555) 890-4567',
        department: 'Quality Control & Metrology',
        position: 'Quality Assurance & CMM Engineer',
        role: 'Manager',
        productionLineId: null,
        productionLineName: 'Quality Metrology Lab',
        shift: 'Morning (06:00 - 14:00)',
        status: 'Active',
        hireDate: '2023-01-10',
        certifications: ['ASQ Certified Quality Engineer (CQE)', 'ISO 9001 Lead Auditor']
      },
      {
        id: 'emp-8',
        employeeId: 'EMP-1008',
        fullName: 'Michael Chang',
        email: 'michael.c@smartfactory.io',
        phone: '+1 (555) 901-5678',
        department: 'Assembly & Integration',
        position: 'SMT Line Solder Technician',
        role: 'Employee',
        productionLineId: 'line-2',
        productionLineName: 'Line B - Electronics SMT & Soldering',
        shift: 'Evening (14:00 - 22:00)',
        status: 'Active',
        hireDate: '2024-02-15',
        certifications: ['SMT Process Optimization', 'ESD Control Standards']
      }
    ];

    // Notifications
    this.notifications = [
      {
        id: 'notif-1',
        title: 'Critical Spindle Fault Detected',
        message: '5-Axis Heavy CNC Machining Center (MCH-106) vibration exceeded 4.8 mm/s on Line C. Automatic safe halt triggered.',
        type: 'fault',
        severity: 'error',
        targetRoles: ['Admin', 'Manager', 'Supervisor'],
        readBy: [],
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        link: '/machines'
      },
      {
        id: 'notif-2',
        title: 'Low Stock Alert: Titanium Grade 5 Bar',
        message: 'Current inventory for Titanium Round Bar Ø60mm (INV-TI-303) is at 18 meters, below the 50-meter threshold.',
        type: 'inventory',
        severity: 'warning',
        targetRoles: ['Admin', 'Manager', 'Supervisor'],
        readBy: [],
        timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
        link: '/inventory'
      },
      {
        id: 'notif-3',
        title: 'Upcoming Scheduled Maintenance',
        message: 'Preventive maintenance for Reflow Oven (MCH-105) is scheduled in 3 days. Prepare heating probe replacements.',
        type: 'maintenance',
        severity: 'info',
        targetRoles: ['Admin', 'Manager', 'Supervisor'],
        readBy: ['usr-1'],
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        link: '/maintenance'
      },
      {
        id: 'notif-4',
        title: 'Daily Production Target Milestone',
        message: 'Line B - Electronics SMT achieved 96.4% efficiency milestone for batch PR-2026-0825-02.',
        type: 'production',
        severity: 'success',
        targetRoles: ['Admin', 'Manager', 'Supervisor', 'Employee'],
        readBy: [],
        timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
        link: '/production'
      }
    ];

    // Audit Logs
    this.auditLogs = [
      {
        id: 'aud-1',
        user: 'Alexander Vance',
        userEmail: 'admin@smartfactory.io',
        userRole: 'Admin',
        action: 'USER_LOGIN',
        resource: 'AUTH_SERVICE',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        result: 'Success',
        ipAddress: '192.168.10.45',
        userAgent: 'Mozilla/5.0 (Industrial Workstation; Linux x86_64)',
        details: 'Admin user authenticated successfully with multi-factor token.'
      },
      {
        id: 'aud-2',
        user: 'Marcus Thorne',
        userEmail: 'supervisor@smartfactory.io',
        userRole: 'Supervisor',
        action: 'INVENTORY_STOCK_OUT',
        resource: 'INV-AL-202',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        result: 'Success',
        ipAddress: '192.168.10.112',
        userAgent: 'Mozilla/5.0 (Tablet Touch Interface; Android 14)',
        details: 'Issued 25 sheets of Aluminum 6061-T6 for work order REQ-4412.'
      },
      {
        id: 'aud-3',
        user: 'David Chen',
        userEmail: 'david.chen@smartfactory.io',
        userRole: 'Supervisor',
        action: 'FAULT_REPORTED',
        resource: 'MCH-106',
        timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
        result: 'Warning',
        ipAddress: '192.168.10.88',
        userAgent: 'Mozilla/5.0 (CNC HMI Station; Windows 10 IoT)',
        details: 'Critical vibration fault FLT-2026-0825-01 logged for 5-Axis CNC.'
      },
      {
        id: 'aud-4',
        user: 'Sarah Sterling',
        userEmail: 'manager@smartfactory.io',
        userRole: 'Manager',
        action: 'REPORT_EXPORTED',
        resource: 'PRODUCTION_REPORTS',
        timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
        result: 'Success',
        ipAddress: '192.168.10.15',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5)',
        details: 'Generated and exported Monthly OEE & Production Report (PDF).'
      },
      {
        id: 'aud-5',
        user: 'Unknown Attacker',
        userEmail: 'intruder@external.net',
        userRole: 'Anonymous',
        action: 'UNAUTHORIZED_ACCESS_BLOCKED',
        resource: '/api/admin/users',
        timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
        result: 'Failure',
        ipAddress: '203.0.113.195',
        userAgent: 'OWASP ZAP / Automated Scanner',
        details: 'Server blocked unauthenticated request to administrative endpoint with 401 Unauthorized.'
      }
    ];
  }
}

export const db = new InMemoryDB();
