export function generatePedigreeTestData(options = {}) {
  const {
    nodeCount = 500,
    cycleProbability = 0.15,
    inbreedingProbability = 0.2,
    baseCatNo = 'TEST',
  } = options

  const nodes = new Map()
  const edges = []
  const cycles = []
  const inbreedingRelations = []

  function createNode(catNo, generation, name) {
    const isMale = Math.random() > 0.5
    const breeds = ['英国短毛猫', '美国短毛猫', '布偶猫', '暹罗猫', '波斯猫', '缅因猫', '苏格兰折耳']
    return {
      catNo,
      name: name || `${isMale ? '公' : '母'}猫_${catNo}`,
      breed: breeds[Math.floor(Math.random() * breeds.length)],
      gender: isMale ? 'MALE' : 'FEMALE',
      birthDate: `202${Math.floor(Math.random() * 6)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      color: ['白色', '黑色', '灰色', '虎斑', '三花', '橘色'][Math.floor(Math.random() * 6)],
      generation,
      father: null,
      mother: null,
      awards: [],
      registrationNo: `REG-${catNo}`,
      _visited: false,
      _inPath: false,
    }
  }

  const root = createNode(`${baseCatNo}_000`, 1, '太祖')
  nodes.set(root.catNo, root)

  let currentNo = 1
  const generationNodes = []
  generationNodes[1] = [root]

  for (let gen = 2; gen <= 5; gen++) {
    generationNodes[gen] = []
    const prevGen = generationNodes[gen - 1]

    for (const parent of prevGen) {
      if (nodes.size >= nodeCount) break

      if (Math.random() < inbreedingProbability && generationNodes[gen - 2] && generationNodes[gen - 2].length > 0) {
        const grandGen = generationNodes[gen - 2]
        const inbreedPartner = grandGen[Math.floor(Math.random() * grandGen.length)]

        if (inbreedPartner.catNo !== parent.catNo &&
            ((parent.gender === 'MALE' && inbreedPartner.gender === 'FEMALE') ||
             (parent.gender === 'FEMALE' && inbreedPartner.gender === 'MALE'))) {

          const childCatNo = `${baseCatNo}_${String(currentNo++).padStart(3, '0')}`
          const child = createNode(childCatNo, gen)

          if (parent.gender === 'MALE') {
            child.father = parent
            child.mother = inbreedPartner
          } else {
            child.father = inbreedPartner
            child.mother = parent
          }

          inbreedingRelations.push({
            child: child.catNo,
            father: child.father.catNo,
            mother: child.mother.catNo,
            relationType: `第${gen}代与第${gen - 2}代近亲繁殖`,
            inbreedingCoefficient: calculateInbreedingCoefficient(parent, inbreedPartner),
          })

          nodes.set(child.catNo, child)
          generationNodes[gen].push(child)
          edges.push({ from: parent.catNo, to: child.catNo, type: 'parent' })
          edges.push({ from: inbreedPartner.catNo, to: child.catNo, type: 'parent' })
          continue
        }
      }

      const fatherCatNo = `${baseCatNo}_${String(currentNo++).padStart(3, '0')}`
      const motherCatNo = `${baseCatNo}_${String(currentNo++).padStart(3, '0')}`

      const father = createNode(fatherCatNo, gen)
      const mother = createNode(motherCatNo, gen)

      father.gender = 'MALE'
      mother.gender = 'FEMALE'

      parent.father = father
      parent.mother = mother

      nodes.set(fatherCatNo, father)
      nodes.set(motherCatNo, mother)
      generationNodes[gen].push(father, mother)
      edges.push({ from: fatherCatNo, to: parent.catNo, type: 'parent' })
      edges.push({ from: motherCatNo, to: parent.catNo, type: 'parent' })

      if (Math.random() < cycleProbability && gen > 2) {
        const cycleTargetGen = gen - 2
        if (generationNodes[cycleTargetGen] && generationNodes[cycleTargetGen].length > 0) {
          const targetNode = generationNodes[cycleTargetGen][Math.floor(Math.random() * generationNodes[cycleTargetGen].length)]

          if (Math.random() > 0.5 && !targetNode.father) {
            const cycleFather = generationNodes[gen][Math.floor(Math.random() * generationNodes[gen].length)]
            if (cycleFather.gender === 'MALE' && cycleFather.catNo !== targetNode.catNo) {
              targetNode.father = cycleFather
              cycles.push({
                from: cycleFather.catNo,
                to: targetNode.catNo,
                type: 'cycle',
                description: `${cycleFather.catNo} 既是 ${targetNode.catNo} 的后代，也是其父亲，形成环`,
              })
              edges.push({ from: cycleFather.catNo, to: targetNode.catNo, type: 'cycle' })
            }
          }
        }
      }
    }
  }

  const flatNodes = Array.from(nodes.values())
  const uniqueNodes = new Set()
  const duplicateReferences = []

  function countReferences(node, path = []) {
    if (!node) return
    if (uniqueNodes.has(node.catNo)) {
      duplicateReferences.push({
        catNo: node.catNo,
        path: [...path],
        count: (duplicateReferences.find(d => d.catNo === node.catNo)?.count || 1) + 1,
      })
      return
    }
    uniqueNodes.add(node.catNo)
    path.push(node.catNo)
    countReferences(node.father, path)
    countReferences(node.mother, path)
    path.pop()
  }

  countReferences(root)

  function detectAllCycles(node, visited = new Set(), path = []) {
    if (!node) return
    if (path.includes(node.catNo)) {
      const cycleStart = path.indexOf(node.catNo)
      cycles.push({
        path: path.slice(cycleStart),
        description: `检测到环: ${path.slice(cycleStart).join(' → ')} → ${node.catNo}`,
      })
      return
    }
    if (visited.has(node.catNo)) return

    visited.add(node.catNo)
    path.push(node.catNo)
    detectAllCycles(node.father, visited, path)
    detectAllCycles(node.mother, visited, path)
    path.pop()
  }

  detectAllCycles(root)

  return {
    root,
    nodes: flatNodes,
    edges,
    stats: {
      totalNodes: nodes.size,
      totalEdges: edges.length,
      uniqueNodes: uniqueNodes.size,
      cycles: cycles.length,
      inbreedingRelations: inbreedingRelations.length,
      duplicateReferences: duplicateReferences.length,
      generations: generationNodes.filter(g => g.length > 0).length,
      nodesPerGeneration: generationNodes.map((g, i) => ({ generation: i, count: g.length })).filter(g => g.count > 0),
    },
    cycles,
    inbreedingRelations,
    duplicateReferences,
  }
}

function calculateInbreedingCoefficient(parent1, parent2) {
  const genDiff = Math.abs((parent1.generation || 1) - (parent2.generation || 1))
  if (genDiff === 0) return 0.25
  if (genDiff === 1) return 0.125
  if (genDiff === 2) return 0.0625
  return 0.03125
}

export function generateLargeScaleData(nodeCount = 1000) {
  return generatePedigreeTestData({
    nodeCount,
    cycleProbability: 0.08,
    inbreedingProbability: 0.15,
    baseCatNo: 'LARGE',
  })
}

export function generateCycleOnlyData() {
  return generatePedigreeTestData({
    nodeCount: 50,
    cycleProbability: 0.5,
    inbreedingProbability: 0.3,
    baseCatNo: 'CYCLE',
  })
}

export function generateNormalData() {
  return generatePedigreeTestData({
    nodeCount: 100,
    cycleProbability: 0,
    inbreedingProbability: 0,
    baseCatNo: 'NORMAL',
  })
}
