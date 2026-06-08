export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.startTimes = new Map()
  }

  start(marker) {
    this.startTimes.set(marker, {
      time: performance.now(),
      memory: this.getMemoryUsage(),
    })
  }

  end(marker) {
    const start = this.startTimes.get(marker)
    if (!start) return null

    const endTime = performance.now()
    const endMemory = this.getMemoryUsage()
    const duration = endTime - start.time
    const memoryDelta = endMemory - start.memory

    const metric = {
      duration,
      memoryDelta,
      startTime: start.time,
      endTime,
      startMemory: start.memory,
      endMemory,
    }

    if (!this.metrics.has(marker)) {
      this.metrics.set(marker, [])
    }
    this.metrics.get(marker).push(metric)
    this.startTimes.delete(marker)

    return metric
  }

  measure(marker, fn) {
    this.start(marker)
    try {
      const result = fn()
      const metric = this.end(marker)
      return { result, metric }
    } catch (e) {
      this.end(marker)
      throw e
    }
  }

  async measureAsync(marker, fn) {
    this.start(marker)
    try {
      const result = await fn()
      const metric = this.end(marker)
      return { result, metric }
    } catch (e) {
      this.end(marker)
      throw e
    }
  }

  getMemoryUsage() {
    if (performance.memory) {
      return performance.memory.usedJSHeapSize / 1024 / 1024
    }
    return 0
  }

  getMetrics(marker) {
    const data = this.metrics.get(marker) || []
    if (data.length === 0) return null

    const durations = data.map(d => d.duration)
    const memories = data.map(d => d.endMemory)

    return {
      count: data.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      maxDuration: Math.max(...durations),
      minDuration: Math.min(...durations),
      avgMemory: memories.reduce((a, b) => a + b, 0) / memories.length,
      maxMemory: Math.max(...memories),
      last: data[data.length - 1],
      all: data,
    }
  }

  getAllMetrics() {
    const result = {}
    for (const [marker] of this.metrics) {
      result[marker] = this.getMetrics(marker)
    }
    return result
  }

  reset(marker) {
    if (marker) {
      this.metrics.delete(marker)
    } else {
      this.metrics.clear()
    }
  }

  generateReport() {
    const allMetrics = this.getAllMetrics()
    const report = {
      generatedAt: new Date().toISOString(),
      totalMeasurements: Object.values(allMetrics).reduce((sum, m) => sum + m.count, 0),
      metrics: allMetrics,
    }
    return report
  }
}

export const fpsMonitor = {
  frames: 0,
  lastTime: performance.now(),
  fps: 0,
  history: [],
  maxHistory: 60,

  tick() {
    this.frames++
    const now = performance.now()
    if (now - this.lastTime >= 1000) {
      this.fps = Math.round(this.frames * 1000 / (now - this.lastTime))
      this.history.push({ time: now, fps: this.fps })
      if (this.history.length > this.maxHistory) {
        this.history.shift()
      }
      this.frames = 0
      this.lastTime = now
    }
    return this.fps
  },

  getStats() {
    const fpsValues = this.history.map(h => h.fps)
    if (fpsValues.length === 0) return { current: 0, avg: 0, min: 0, max: 0 }
    return {
      current: this.fps,
      avg: fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length,
      min: Math.min(...fpsValues),
      max: Math.max(...fpsValues),
      history: [...this.history],
    }
  },

  reset() {
    this.frames = 0
    this.lastTime = performance.now()
    this.fps = 0
    this.history = []
  },
}

export function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

export function formatDuration(ms) {
  if (ms < 1000) return ms.toFixed(2) + ' ms'
  return (ms / 1000).toFixed(2) + ' s'
}

export const perfMonitor = new PerformanceMonitor()
