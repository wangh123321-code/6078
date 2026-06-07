import React, { useState, useEffect } from 'react'
import {
  Card,
  Descriptions,
  Tag,
  Typography,
  Button,
  Space,
  List,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Row,
  Col,
} from 'antd'
import {
  ArrowLeftOutlined,
  EditOutlined,
  FileTextOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { getCatByNo, getPedigree, getOffspring, addAward } from '../api/cat.js'
import { verifyCatOnChain, getCatChainRecords } from '../api/blockchain.js'
import { generateCertificate, downloadCertificate } from '../api/certificate.js'
import { isCatteryAdmin } from '../utils/auth.js'
import PedigreeTree from '../components/PedigreeTree.jsx'

const { Title } = Typography

function CatDetail() {
  const { catNo } = useParams()
  const navigate = useNavigate()
  const [cat, setCat] = useState(null)
  const [pedigree, setPedigree] = useState(null)
  const [offspring, setOffspring] = useState([])
  const [chainRecords, setChainRecords] = useState([])
  const [verifyResult, setVerifyResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [awardModal, setAwardModal] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadCatData()
  }, [catNo])

  const loadCatData = async () => {
    setLoading(true)
    try {
      const [catRes, pedigreeRes, offspringRes, chainRes, verifyRes] = await Promise.all([
        getCatByNo(catNo),
        getPedigree(catNo, 5),
        getOffspring(catNo),
        getCatChainRecords(catNo),
        verifyCatOnChain(catNo),
      ])

      setCat(catRes.data)
      setPedigree(pedigreeRes.data)
      setOffspring(offspringRes.data)
      setChainRecords(chainRes.data)
      setVerifyResult(verifyRes.data)
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateCertificate = async () => {
    try {
      await generateCertificate(cat.id)
      message.success('证书生成成功')
      downloadCertificate(cat.catNo)
    } catch (error) {
      console.error('生成证书失败:', error)
    }
  }

  const handleAddAward = async (values) => {
    try {
      await addAward(cat.id, {
        ...values,
        awardDate: values.awardDate?.format('YYYY-MM-DD'),
      })
      message.success('获奖记录添加成功')
      setAwardModal(false)
      form.resetFields()
      loadCatData()
    } catch (error) {
      console.error('添加获奖记录失败:', error)
    }
  }

  if (loading) return <div>加载中...</div>
  if (!cat) return <div>猫咪不存在</div>

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/cats')}>
          返回列表
        </Button>
      </div>

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            {cat.name}
            <Tag color={cat.gender === 'MALE' ? 'blue' : 'pink'} style={{ marginLeft: 12 }}>
              {cat.gender === 'MALE' ? '公' : '母'}
            </Tag>
            {cat.onChain ? (
              <Tag color="green" icon={<LinkOutlined />} style={{ marginLeft: 8 }}>
                已上链
              </Tag>
            ) : (
              <Tag color="orange">未上链</Tag>
            )}
          </Title>
          <p style={{ color: '#666', marginTop: 8 }}>编号：{cat.catNo}</p>
        </div>
        <Space>
          {verifyResult?.valid ? (
            <Tag color="green" icon={<CheckCircleOutlined />}>
              区块链验证通过
            </Tag>
          ) : (
            <Tag color="red" icon={<CloseCircleOutlined />}>
              数据可能已篡改
            </Tag>
          )}
          {isCatteryAdmin() && (
            <>
              <Button icon={<EditOutlined />} onClick={() => navigate(`/cats/${catNo}/edit`)}>
                编辑
              </Button>
              <Button type="primary" icon={<FileTextOutlined />} onClick={handleGenerateCertificate}>
                生成证书
              </Button>
              <Button icon={<PlusOutlined />} onClick={() => setAwardModal(true)}>
                添加获奖
              </Button>
            </>
          )}
        </Space>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={12}>
          <Card title="基本信息" style={{ marginBottom: 24 }}>
            <Descriptions column={2}>
              <Descriptions.Item label="品种">{cat.breed}</Descriptions.Item>
              <Descriptions.Item label="毛色">{cat.color || '-'}</Descriptions.Item>
              <Descriptions.Item label="眼色">{cat.eyeColor || '-'}</Descriptions.Item>
              <Descriptions.Item label="被毛图案">{cat.coatPattern || '-'}</Descriptions.Item>
              <Descriptions.Item label="出生日期">
                {cat.birthDate ? dayjs(cat.birthDate).format('YYYY-MM-DD') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="芯片号">{cat.microchipNo || '-'}</Descriptions.Item>
              <Descriptions.Item label="注册编号">{cat.registrationNo || '-'}</Descriptions.Item>
              <Descriptions.Item label="注册日期">
                {cat.registrationDate ? dayjs(cat.registrationDate).format('YYYY-MM-DD') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="猫主人">{cat.ownerName || '-'}</Descriptions.Item>
              <Descriptions.Item label="所属猫舍">{cat.catteryName || '-'}</Descriptions.Item>
              <Descriptions.Item label="父亲编号">
                {cat.fatherCatNo ? (
                  <a onClick={() => navigate(`/cats/${cat.fatherCatNo}`)} style={{ cursor: 'pointer' }}>
                    {cat.fatherCatNo}
                  </a>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="母亲编号">
                {cat.motherCatNo ? (
                  <a onClick={() => navigate(`/cats/${cat.motherCatNo}`)} style={{ cursor: 'pointer' }}>
                    {cat.motherCatNo}
                  </a>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>{cat.notes || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>

          {cat.awards && cat.awards.length > 0 && (
            <Card title="获奖记录" style={{ marginBottom: 24 }}>
              <List
                dataSource={cat.awards}
                renderItem={(award, index) => (
                  <List.Item key={index}>
                    <List.Item.Meta
                      title={award.competitionName}
                      description={`${award.awardName} · ${award.rank} · ${dayjs(award.awardDate).format('YYYY-MM-DD')}`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}

          {cat.onChain && (
            <Card title="区块链存证信息">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="区块哈希">
                  <code style={{ wordBreak: 'break-all' }}>{cat.blockchainHash}</code>
                </Descriptions.Item>
                <Descriptions.Item label="交易哈希">
                  <code style={{ wordBreak: 'break-all' }}>{cat.transactionHash}</code>
                </Descriptions.Item>
                <Descriptions.Item label="上链时间">
                  {cat.onChainTime ? dayjs(cat.onChainTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}
        </Col>

        <Col xs={24} lg={12}>
          <Card title="五代系谱图" style={{ marginBottom: 24 }}>
            <PedigreeTree data={pedigree} onNodeClick={(node) => navigate(`/cats/${node.catNo}`)} />
          </Card>

          {offspring.length > 0 && (
            <Card title={`后代 (${offspring.length})`} style={{ marginBottom: 24 }}>
              <List
                dataSource={offspring}
                renderItem={(item) => (
                  <List.Item key={item.id} actions={[
                    <a onClick={() => navigate(`/cats/${item.catNo}`)}>查看详情</a>
                  ]}>
                    <List.Item.Meta
                      title={item.name}
                      description={`${item.catNo} · ${item.breed} · ${item.gender === 'MALE' ? '公' : '母'}`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}

          {chainRecords.length > 0 && (
            <Card title={`区块链记录 (${chainRecords.length})`}>
              <List
                dataSource={chainRecords}
                renderItem={(record) => (
                  <List.Item key={record.id}>
                    <List.Item.Meta
                      title={`区块 #${record.blockNumber} · ${record.operationType}`}
                      description={
                        <div>
                          <div>哈希: <code style={{ fontSize: 11 }}>{record.recordHash?.substring(0, 32)}...</code></div>
                          <div>时间: {dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss')}</div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}
        </Col>
      </Row>

      <Modal
        title="添加获奖记录"
        open={awardModal}
        onCancel={() => setAwardModal(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddAward}>
          <Form.Item name="competitionName" label="赛事名称" rules={[{ required: true }]}>
            <Input placeholder="请输入赛事名称" />
          </Form.Item>
          <Form.Item name="awardName" label="奖项名称" rules={[{ required: true }]}>
            <Input placeholder="请输入奖项名称" />
          </Form.Item>
          <Form.Item name="rank" label="名次" rules={[{ required: true }]}>
            <Input placeholder="例如：第一名、冠军" />
          </Form.Item>
          <Form.Item name="awardDate" label="获奖日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">提交</Button>
              <Button onClick={() => setAwardModal(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CatDetail
