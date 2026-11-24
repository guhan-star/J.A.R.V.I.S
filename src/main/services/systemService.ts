import * as os from 'os';
import type { SystemTelemetry, DiagnosticResult } from '../../shared/types';

class SystemService {
  private lastCpuTimes: { idle: number; total: number } | null = null;
  private currentCpuPercent = 0;
  private simulatedFlux = 98.4;
  private simulatedBattery = 92;
  private isSimulatedCharging = true;

  constructor() {
    this.measureCpuUsage();
  }

  /**
   * Samples CPU times to calculate real CPU utilization
   */
  private measureCpuUsage(): number {
    const cpus = os.cpus();
    if (!cpus || cpus.length === 0) return 0;

    let totalIdle = 0;
    let totalTick = 0;

    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalTick += (cpu.times as any)[type];
      }
      totalIdle += cpu.times.idle;
    }

    if (this.lastCpuTimes) {
      const idleDelta = totalIdle - this.lastCpuTimes.idle;
      const totalDelta = totalTick - this.lastCpuTimes.total;
      if (totalDelta > 0) {
        const usage = 100 - Math.round((100 * idleDelta) / totalDelta);
        this.currentCpuPercent = Math.max(0, Math.min(100, usage));
      }
    }

    this.lastCpuTimes = { idle: totalIdle, total: totalTick };
    return this.currentCpuPercent;
  }

  public getTelemetry(): SystemTelemetry {
    // 1. Measure real CPU usage
    const cpuUsage = this.measureCpuUsage();
    const cpus = os.cpus();
    const cpuModel = cpus[0]?.model || 'Core Microarchitecture';
    const cpuSpeed = cpus[0]?.speed || 3200;
    const cpuCores = cpus.length;

    // 2. Measure real Memory
    const totalBytes = os.totalmem();
    const freeBytes = os.freemem();
    const usedBytes = totalBytes - freeBytes;
    const totalGB = Number((totalBytes / (1024 * 1024 * 1024)).toFixed(1));
    const usedGB = Number((usedBytes / (1024 * 1024 * 1024)).toFixed(1));
    const freeGB = Number((freeBytes / (1024 * 1024 * 1024)).toFixed(1));
    const memoryPercent = Math.round((usedBytes / totalBytes) * 100);

    // 3. Arc Reactor Flux & Battery (Clearly marked telemetry state)
    // Dynamic variance for subtle HUD liveliness
    this.simulatedFlux = Number((98.2 + (Math.sin(Date.now() / 3000) * 1.2)).toFixed(1));

    return {
      cpu: {
        usagePercent: cpuUsage,
        model: cpuModel,
        cores: cpuCores,
        speedMHz: cpuSpeed,
        isRealHardware: true, // Transparent indicator
      },
      memory: {
        totalGB,
        usedGB,
        freeGB,
        usagePercent: memoryPercent,
        isRealHardware: true, // Transparent indicator
      },
      battery: {
        percent: this.simulatedBattery,
        isCharging: this.isSimulatedCharging,
        powerState: 'AC_POWER',
        timeRemainingMinutes: 480,
        isRealHardware: false, // Explicitly identified as simulated/mock
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        uptimeSeconds: Math.floor(os.uptime()),
        osVersion: `${os.type()} ${os.release()}`,
        protocolState: 'OPTIMAL',
        threatLevel: 'DEFCON 5',
        reactorFluxPercent: this.simulatedFlux,
      },
      timestamp: Date.now(),
    };
  }

  public runDiagnostics(): DiagnosticResult[] {
    const memoryPercent = Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100);
    return [
      {
        subsystem: 'NEURAL_CORE_AI',
        status: 'ONLINE',
        integrity: 99.4,
        detail: 'Inference channels synchronized. Latency 1.2ms.',
      },
      {
        subsystem: 'HARDWARE_HOST_TELEMETRY',
        status: 'ONLINE',
        integrity: 100,
        detail: `Probed ${os.cpus().length} physical/logical threads. Memory load ${memoryPercent}%.`,
      },
      {
        subsystem: 'ARC_REACTOR_POWER_GRID',
        status: 'ONLINE',
        integrity: 98.7,
        detail: 'Clean power delivery. Simulated auxiliary cell standby.',
      },
      {
        subsystem: 'DEFENSE_FIREWALL_MATRIX',
        status: 'ONLINE',
        integrity: 99.9,
        detail: 'Zero intrusion anomalies detected across active interfaces.',
      },
      {
        subsystem: 'AUDIO_TACTICAL_SYNTHESIZER',
        status: 'ONLINE',
        integrity: 100,
        detail: 'Spatial acoustic feedback online and responsive.',
      },
    ];
  }
}

export const systemService = new SystemService();
