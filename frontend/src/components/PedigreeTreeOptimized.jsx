import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { Card, Tooltip, Typography, Tag, Space, Badge, Button } from 'antd'
import { WarningOutlined, InfoCircleOutlined, FullscreenOutlined } from '@ant-design/icons'
import { traversePedigreeBFS, calculateHierarchicalLayout, getVisibleNodes, getVisibleEdges, nodeCache } from '../utils/pedigreeLayout.js'
import { perfMonitor, fpsMonitor, formatDuration, formatBytes } from '../utils/performanceMonitor.js'

const { Text, Title } = Typography

const CONFIG = {
  nodeWidth: 140,
  nodeHeight: 80,
  horizontalGap: 60,
  verticalGap: 100,
  padding: 50,
  minZoom: 0.2,
  maxZoom: 3,
  zoomStep: 0.1,
  colors: {
    male: '#1890ff',
    maleBg: '#e6f7ff',
    female: '#eb2f96',
    femaleBg: '#fff0f6',
    inbreeding: '#fa8c16',
    inbreedingBg: '#fff7e6',
    cycle: '#f5222d',
    cycleBg: '#fff1f0',
    normalEdge: '#d9d9d9',
    inbreedingEdge: '#fa8c16',
    cycleEdge: '#f5222d',
    selected: '#722ed1',
    selectedBg: '#f9f0ff',
  },
}

function PedigreeTreeOptimized({ data, onNodeClick, maxGeneration = 5 }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const animationRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredNode, setHoveredNode] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [showStats, setShowStats] = useState(true)
  const [renderStats, setRenderStats] = useState(null)
  const [fullscreen, setFullscreen] = useState(false)

  const layoutResult = useMemo(() => {
    if (!data) return null

    perfMonitor.start('total_render')
    perfMonitor.start('traverse')
    const traverseResult = traversePedigreeBFS(data, maxGeneration)
    perfMonitor.end('traverse')

    perfMonitor.start('layout')
    const layout = calculateHierarchicalLayout(traverseResult, {
      nodeWidth: CONFIG.nodeWidth,
      nodeHeight: CONFIG.nodeHeight,
      horizontalGap: CONFIG.horizontalGap,
      verticalGap: CONFIG.verticalGap,
      padding: CONFIG.padding,
    })
    perfMonitor.end('layout')

    const { nodes, edges, nodeMap, cycles, inbreedingRelations, generations } = traverseResult
    const totalMetric = perfMonitor.end('total_render')

    setRenderStats({
      nodeCount: nodes.length,
      edgeCount: edges.length,
      cycleCount: cycles.length,
      inbreedingCount: inbreedingRelations.length,
      generationCount: generations.size,
      traverseTime: perfMonitor.getMetrics('traverse')?.last?.duration || 0,
      layoutTime: perfMonitor.getMetrics('layout')?.last?.duration || 0,
      totalTime: totalMetric?.duration || 0,
      memory: totalMetric?.endMemory || 0,
      cacheStats: nodeCache.getStats(),
    })

    return {
      ...layout,
      cycles,
      inbreedingRelations,
      generations,
    }
  }, [data, maxGeneration])

  const { nodes, edges, totalWidth, totalHeight, cycles, inbreedingRelations, generations } = layoutResult || {}

  const getNodeAtPosition = useCallback((canvasX, canvasY) => {
    if (!layoutResult) return null

    const worldX = (canvasX - offset.x) / scale
    const worldY = (canvasY - offset.y) / scale

    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i]
      if (worldX >= node.x && worldX <= node.x + node.width &&
          worldY >= node.y && worldY <= node.y + node.height) {
        return node
      }
    }
    return null
  }, [layoutResult, offset, scale, nodes])

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !layoutResult) return

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const viewWidth = rect.width
    const viewHeight = rect.height

    ctx.clearRect(0, 0, viewWidth, viewHeight)

    const viewport = {
      scrollX: -offset.x / scale,
      scrollY: -offset.y / scale,
      viewWidth: viewWidth / scale,
      viewHeight: viewHeight / scale,
    }

    perfMonitor.start('cull')
    const visibleNodes = getVisibleNodes(nodes, viewport)
    const visibleEdges = getVisibleEdges(edges, visibleNodes)
    perfMonitor.end('cull')

    perfMonitor.start('draw_edges')
    ctx.save()
    ctx.translate(offset.x, offset.y)
    ctx.scale(scale, scale)

    visibleEdges.forEach(edge => {
      ctx.beginPath()
      ctx.moveTo(edge.fromX, edge.fromY)

      const midY = (edge.fromY + edge.toY) / 2
      ctx.bezierCurveTo(
        edge.fromX, midY,
        edge.toX, midY,
        edge.toX, edge.toY
      )

      let strokeColor = CONFIG.colors.normalEdge
      let lineWidth = 2

      if (edge.type === 'inbreeding') {
        strokeColor = CONFIG.colors.inbreedingEdge
        lineWidth = 3
      } else if (edge.type === 'cycle') {
        strokeColor = CONFIG.colors.cycleEdge
        lineWidth = 3
        ctx.setLineDash([5, 5])
      }

      const isInbreeding = inbreedingRelations.some(
        r => r.father === edge.from || r.mother === edge.from
      )
      if (isInbreeding) {
        strokeColor = CONFIG.colors.inbreedingEdge
        lineWidth = 3
      }

      ctx.strokeStyle = strokeColor
      ctx.lineWidth = lineWidth
      ctx.stroke()
      ctx.setLineDash([])
    })
    ctx.restore()
    perfMonitor.end('draw_edges')

    perfMonitor.start('draw_nodes')
    ctx.save()
    ctx.translate(offset.x, offset.y)
    ctx.scale(scale, scale)

    visibleNodes.forEach(node => {
      const isMale = node.gender === 'MALE'
      const isInbreeding = node.isInbreeding
      const hasCycle = node.hasCycle
      const isHovered = hoveredNode?.catNo === node.catNo
      const isSelected = selectedNode?.catNo === node.catNo

      let borderColor = isMale ? CONFIG.colors.male : CONFIG.colors.female
      let bgColor = isMale ? CONFIG.colors.maleBg : CONFIG.colors.femaleBg

      if (isInbreeding) {
        borderColor = CONFIG.colors.inbreeding
        bgColor = CONFIG.colors.inbreedingBg
      }
      if (hasCycle) {
        borderColor = CONFIG.colors.cycle
        bgColor = CONFIG.colors.cycleBg
      }
      if (isSelected) {
        borderColor = CONFIG.colors.selected
        bgColor = CONFIG.colors.selectedBg
      }

      const radius = 8
      const x = node.x
      const y = node.y
      const w = node.width
      const h = node.height

      if (isHovered) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
        ctx.shadowBlur = 10
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 4
      }

      ctx.beginPath()
      ctx.roundRect(x, y, w, h, radius)
      ctx.fillStyle = bgColor
      ctx.fill()

      ctx.strokeStyle = borderColor
      ctx.lineWidth = isHovered || isSelected ? 3 : 2
      ctx.stroke()

      ctx.shadowColor = 'transparent'

      ctx.fillStyle = '#333'
      ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      const name = node.name || node.catNo
      const displayName = name.length > 10 ? name.substring(0, 10) + '...' : name
      ctx.fillText(displayName, x + w / 2, y + 8)

      ctx.fillStyle = '#666'
      ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      ctx.fillText(node.catNo, x + w / 2, y + 30)

      ctx.fillStyle = '#888'
      ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      const breed = node.breed || ''
      const displayBreed = breed.length > 8 ? breed.substring(0, 8) + '...' : breed
      ctx.fillText(displayBreed, x + w / 2, y + 48)

      if (isInbreeding) {
        ctx.fillStyle = CONFIG.colors.inbreeding
        ctx.font = 'bold 10px sans-serif'
        ctx.fillText('⚠ 近亲繁殖', x + w / 2, y + h - 18)
      }
      if (hasCycle) {
        ctx.fillStyle = CONFIG.colors.cycle
        ctx.font = 'bold 10px sans-serif'
        ctx.fillText('↻ 环', x + w / 2, y + h - 18)
      }
    })

    ctx.restore()
    perfMonitor.end('draw_nodes')

    fpsMonitor.tick()
  }, [layoutResult, offset, scale, hoveredNode, selectedNode, nodes, edges, inbreedingRelations])

  useEffect(() => {
    if (layoutResult && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const centerX = (rect.width - totalWidth * scale) / 2
      const centerY = (rect.height - totalHeight * scale) / 2
      setOffset({ x: centerX, y: centerY })
    }
  }, [layoutResult, totalWidth, totalHeight, scale])

  useEffect(() => {
    let running = true

    function animate() {
      if (!running) return
      renderCanvas()
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      running = false
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [renderCanvas])

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      const node = getNodeAtPosition(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
      if (!node) {
        setIsDragging(true)
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
      }
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    } else {
      const node = getNodeAtPosition(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
      setHoveredNode(node)
      canvasRef.current.style.cursor = node ? 'pointer' : (isDragging ? 'grabbing' : 'grab')
    }
  }

  const handleMouseUp = (e) => {
    setIsDragging(false)
    const node = getNodeAtPosition(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    if (node && !isDragging) {
      setSelectedNode(node)
      onNodeClick && onNodeClick(node)
    }
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -CONFIG.zoomStep : CONFIG.zoomStep
    const newScale = Math.max(CONFIG.minZoom, Math.min(CONFIG.maxZoom, scale + delta))

    const rect = canvasRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const worldX = (mouseX - offset.x) / scale
    const worldY = (mouseY - offset.y) / scale

    setScale(newScale)
    setOffset({
      x: mouseX - worldX * newScale,
      y: mouseY - worldY * newScale,
    })
  }

  const handleResetView = () => {
    if (containerRef.current && layoutResult) {
      const rect = containerRef.current.getBoundingClientRect()
      const fitScale = Math.min(
        rect.width / totalWidth,
        rect.height / totalHeight,
        1
      )
      setScale(fitScale)
      setOffset({
        x: (rect.width - totalWidth * fitScale) / 2,
        y: (rect.height - totalHeight * fitScale) / 2,
      })
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    setFullscreen(!fullscreen)
    setTimeout(() => handleResetView(), 100)
  }

  if (!data) return null

  const fpsStats = fpsMonitor.getStats()

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: fullscreen ? '100vh' : 600,
        background: '#fafafa',
        border: '1px solid #e8e8e8',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { setIsDragging(false); setHoveredNode(null) }}
        onWheel={handleWheel}
      />

      {showStats && renderStats && (
        <Card
          size="small"
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 8,
            minWidth: 200,
            zIndex: 10,
          }}
          title={
            <Space>
              <Text strong>性能监控</Text>
              <Tag color={fpsStats.avg >= 50 ? 'green' : fpsStats.avg >= 30 ? 'orange' : 'red'}>
                {fpsStats.current} FPS
              </Tag>
            </Space>
          }
          extra={
            <a onClick={() => setShowStats(false)}>隐藏</a>
          }
        >
          <div style={{ fontSize: 12, lineHeight: 1.8 }}>
            <div>节点数: <Text strong>{renderStats.nodeCount}</Text></div>
            <div>边数: <Text strong>{renderStats.edgeCount}</Text></div>
            <div>代数: <Text strong>{renderStats.generationCount}</Text></div>
            {renderStats.cycleCount > 0 && (
              <div><Tag color="red">环: {renderStats.cycleCount}</Tag></div>
            )}
            {renderStats.inbreedingCount > 0 && (
              <div><Tag color="orange">近亲繁殖: {renderStats.inbreedingCount}</Tag></div>
            )}
            <div style={{ borderTop: '1px solid #eee', marginTop: 8, paddingTop: 8 }}>
              <div>遍历: <Text type="success">{formatDuration(renderStats.traverseTime)}</Text></div>
              <div>布局: <Text type="success">{formatDuration(renderStats.layoutTime)}</Text></div>
              <div>总计: <Text type="success">{formatDuration(renderStats.totalTime)}</Text></div>
              <div>内存: <Text type="warning">{renderStats.memory.toFixed(2)} MB</Text></div>
            </div>
          </div>
        </Card>
      )}

      {!showStats && (
        <Button
          type="primary"
          size="small"
          icon={<InfoCircleOutlined />}
          style={{ position: 'absolute', top: 12, left: 12, zIndex: 10 }}
          onClick={() => setShowStats(true)}
        >
          显示监控
        </Button>
      )}

      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
        <Space direction="vertical">
          <Space>
            <Button size="small" onClick={() => setScale(s => Math.min(CONFIG.maxZoom, s + CONFIG.zoomStep))}>
              +
            </Button>
            <Text style={{ minWidth: 50, textAlign: 'center' }}>{Math.round(scale * 100)}%</Text>
            <Button size="small" onClick={() => setScale(s => Math.max(CONFIG.minZoom, s - CONFIG.zoomStep))}>
              -
            </Button>
          </Space>
          <Button size="small" onClick={handleResetView}>重置视图</Button>
          <Button size="small" icon={<FullscreenOutlined />} onClick={toggleFullscreen}>
            {fullscreen ? '退出全屏' : '全屏'}
          </Button>
        </Space>
      </div>

      {hoveredNode && (
        <Tooltip
          title={
            <div style={{ maxWidth: 300 }}>
              <Title level={5} style={{ margin: '0 0 8px 0', color: '#fff' }}>
                {hoveredNode.name}
              </Title>
              <div style={{ fontSize: 12, lineHeight: 1.6 }}>
                <div>编号: {hoveredNode.catNo}</div>
                <div>品种: {hoveredNode.breed}</div>
                <div>性别: {hoveredNode.gender === 'MALE' ? '公猫' : '母猫'}</div>
                <div>代数: 第{hoveredNode.generation}代</div>
                {hoveredNode.birthDate && <div>生日: {hoveredNode.birthDate}</div>}
                {hoveredNode.isInbreeding && (
                  <div style={{ color: '#fa8c16', marginTop: 4 }}>
                    <WarningOutlined /> {hoveredNode.inbreedingInfo}
                  </div>
                )}
                {hoveredNode.hasCycle && (
                  <div style={{ color: '#f5222d', marginTop: 4 }}>
                    <WarningOutlined /> {hoveredNode.cycleInfo || '存在循环引用'}
                  </div>
                )}
              </div>
            </div>
          }
          placement="right"
        >
          <div style={{
            position: 'absolute',
            left: (hoveredNode.x + hoveredNode.width / 2) * scale + offset.x,
            top: hoveredNode.y * scale + offset.y,
            width: 1,
            height: 1,
            pointerEvents: 'none',
          }} />
        </Tooltip>
      )}

      <div style={{
        position: 'absolute',
        bottom: 12,
        left: 12,
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '8px 12px',
        borderRadius: 8,
        fontSize: 12,
        zIndex: 10,
      }}>
        <Space size={16}>
          <Space>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: CONFIG.colors.maleBg, border: `1px solid ${CONFIG.colors.male}`, borderRadius: 2 }} />
            公猫
          </Space>
          <Space>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: CONFIG.colors.femaleBg, border: `1px solid ${CONFIG.colors.female}`, borderRadius: 2 }} />
            母猫
          </Space>
          <Space>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: CONFIG.colors.inbreedingBg, border: `1px solid ${CONFIG.colors.inbreeding}`, borderRadius: 2 }} />
            近亲繁殖
          </Space>
          <Space>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: CONFIG.colors.cycleBg, border: `1px solid ${CONFIG.colors.cycle}`, borderRadius: 2 }} />
            循环引用
          </Space>
        </Space>
      </div>

      <div style={{
        position: 'absolute',
        bottom: 12,
        right: 12,
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '8px 12px',
        borderRadius: 8,
        fontSize: 11,
        color: '#666',
        zIndex: 10,
      }}>
        <div>🖱️ 左键拖拽平移 · 滚轮缩放 · 点击节点查看详情</div>
      </div>
    </div>
  )
}

export default PedigreeTreeOptimized
