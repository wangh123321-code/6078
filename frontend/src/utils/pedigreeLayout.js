import { perfMonitor } from './performanceMonitor.js'

export function traversePedigreeBFS(root, maxGeneration = 5) {
  return perfMonitor.measure('traverse_bfs', () => {
    const nodes = []
    const edges = []
    const nodeMap = new Map()
    const visited = new Set()
    const cycles = []
    const inbreedingRelations = []
    const generations = new Map()

    if (!root) return { nodes, edges, nodeMap, cycles, inbreedingRelations, generations }

    const queue = [{ node: root, level: 0, path: [] }]

    while (queue.length > 0) {
      const { node, level, path } = queue.shift()

      if (!node) continue
      if (level >= maxGeneration) continue

      const catNo = node.catNo

      if (path.includes(catNo)) {
        const cycleStart = path.indexOf(catNo)
        cycles.push({
          path: [...path.slice(cycleStart)],
          description: `环: ${path.slice(cycleStart).join(' → ')} → ${catNo}`,
        })
        continue
      }

      if (visited.has(catNo)) {
        continue
      }

      visited.add(catNo)
      nodeMap.set(catNo, { ...node, _level: level })

      if (!generations.has(level)) {
        generations.set(level, [])
      }
      generations.get(level).push(catNo)

      const newPath = [...path, catNo]

      if (node.father && level + 1 < maxGeneration) {
        edges.push({
          from: node.father.catNo,
          to: catNo,
          type: 'father',
          level,
        })
        queue.push({ node: node.father, level: level + 1, path: newPath })
      }

      if (node.mother && level + 1 < maxGeneration) {
        edges.push({
          from: node.mother.catNo,
          to: catNo,
          type: 'mother',
          level,
        })
        queue.push({ node: node.mother, level: level + 1, path: newPath })
      }

      if (node.isInbreeding) {
        inbreedingRelations.push({
          child: catNo,
          father: node.father?.catNo,
          mother: node.mother?.catNo,
          coefficient: node.inbreedingCoefficient,
          info: node.inbreedingInfo,
        })
      }
    }

    generations.forEach((catNos, level) => {
      catNos.forEach(catNo => {
        const node = nodeMap.get(catNo)
        if (node) {
          nodes.push(node)
        }
      })
    })

    return { nodes, edges, nodeMap, cycles, inbreedingRelations, generations }
  }).result
}

export function calculateHierarchicalLayout(traverseResult, options = {}) {
  return perfMonitor.measure('layout_calculate', () => {
    const { nodes, edges, nodeMap, generations } = traverseResult
    const {
      nodeWidth = 140,
      nodeHeight = 80,
      horizontalGap = 60,
      verticalGap = 100,
      padding = 50,
    } = options

    const positionedNodes = new Map()
    const positionedEdges = []

    const maxNodesPerGen = Math.max(...Array.from(generations.values()).map(g => g.length), 1)
    const totalWidth = padding * 2 + maxNodesPerGen * nodeWidth + (maxNodesPerGen - 1) * horizontalGap
    const totalHeight = padding * 2 + generations.size * nodeHeight + (generations.size - 1) * verticalGap

    generations.forEach((catNos, level) => {
      const genWidth = catNos.length * nodeWidth + (catNos.length - 1) * horizontalGap
      const startX = (totalWidth - genWidth) / 2
      const y = padding + level * (nodeHeight + verticalGap)

      catNos.forEach((catNo, index) => {
        const node = nodeMap.get(catNo)
        if (node) {
          const x = startX + index * (nodeWidth + horizontalGap)
          positionedNodes.set(catNo, {
            ...node,
            x,
            y,
            width: nodeWidth,
            height: nodeHeight,
            level,
          })
        }
      })
    })

    edges.forEach(edge => {
      const fromNode = positionedNodes.get(edge.from)
      const toNode = positionedNodes.get(edge.to)
      if (fromNode && toNode) {
        positionedEdges.push({
          ...edge,
          fromX: fromNode.x + nodeWidth / 2,
          fromY: fromNode.y + nodeHeight / 2,
          toX: toNode.x + nodeWidth / 2,
          toY: toNode.y + nodeHeight / 2,
          fromNode,
          toNode,
        })
      }
    })

    return {
      nodes: Array.from(positionedNodes.values()),
      edges: positionedEdges,
      nodeMap: positionedNodes,
      totalWidth,
      totalHeight,
    }
  }).result
}

export class NodeCache {
  constructor() {
    this.cache = new Map()
    this.hitCount = 0
    this.missCount = 0
  }

  get(catNo) {
    if (this.cache.has(catNo)) {
      this.hitCount++
      return this.cache.get(catNo)
    }
    this.missCount++
    return null
  }

  set(catNo, node) {
    this.cache.set(catNo, node)
    return node
  }

  getOrCreate(catNo, creator) {
    const existing = this.get(catNo)
    if (existing) return existing
    const newNode = creator()
    this.set(catNo, newNode)
    return newNode
  }

  has(catNo) {
    return this.cache.has(catNo)
  }

  clear() {
    this.cache.clear()
  }

  getStats() {
    const total = this.hitCount + this.missCount
    return {
      size: this.cache.size,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: total > 0 ? (this.hitCount / total) : 0,
    }
  }
}

export const nodeCache = new NodeCache()

export function getVisibleNodes(nodes, viewport) {
  return perfMonitor.measure('virtual_scroll_cull', () => {
    const { scrollX, scrollY, viewWidth, viewHeight } = viewport
    const margin = 100

    return nodes.filter(node => {
      const nodeRight = node.x + node.width + margin
      const nodeBottom = node.y + node.height + margin
      const nodeLeft = node.x - margin
      const nodeTop = node.y - margin

      const viewRight = scrollX + viewWidth + margin
      const viewBottom = scrollY + viewHeight + margin

      return nodeLeft < viewRight &&
             nodeRight > scrollX - margin &&
             nodeTop < viewBottom &&
             nodeBottom > scrollY - margin
    })
  }).result
}

export function getVisibleEdges(edges, visibleNodes) {
  const visibleCatNos = new Set(visibleNodes.map(n => n.catNo))
  return edges.filter(edge =>
    visibleCatNos.has(edge.from) && visibleCatNos.has(edge.to)
  )
}
