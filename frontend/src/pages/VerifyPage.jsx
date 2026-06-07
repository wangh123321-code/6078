import React, { useState } from 'react'
import {
  Card,
  Input,
  Button,
  Space,
  Typography,
  Alert,
  Descriptions,
  Tag,
  QRCode,
} from 'antd'
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { verifyCertificate, getCertificate } from '../api/certificate.js'
import { verifyCatOnChain } from '../api/blockchain.js'

const { Title, Text } = Typography

function VerifyPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [certificate, setCertificate] = useState(null)
  const [chainResult, setChainResult] = useState(null)

  const handleVerify = async () => {
    if (!code) return

    setLoading(true)
    setResult(null)
    setCertificate(null)
    setChainResult(null)

    try {
      const res = await verifyCertificate(code)
      setResult(res.data)

      if (res.data.valid) {
        const certRes = await getCertificate(code)
        setCertificate(certRes.data)

        if (certRes.data.catNo) {
          const chainRes = await verifyCatOnChain(certRes.data.catNo)
          setChainResult(chainRes.data)
        }
      }
    } catch (error) {
      console.error('验证失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '40px 20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <Card style={{ maxWidth: 700, margin: '0 auto', borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={3} style={{ margin: 0, color: '#333' }}>
            血统证书真伪验证
          </Title>
          <p style={{ color: '#666', marginTop: 8 }}>
            请输入证书验证码或扫描证书上的二维码
          </p>
        </div>

        <Space.Compact style={{ width: '100%', marginBottom: 24 }}>
          <Input
            size="large"
            placeholder="请输入证书验证码"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onPressEnter={handleVerify}
            allowClear
          />
          <Button
            type="primary"
            size="large"
            icon={<SearchOutlined />}
            onClick={handleVerify}
            loading={loading}
          >
            验证
          </Button>
        </Space.Compact>

        {result && (
          result.valid ? (
            <Alert
              message="验证通过"
              description="该证书为有效证书，数据已通过区块链存证验证。"
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
              style={{ marginBottom: 24 }}
            />
          ) : (
            <Alert
              message="验证失败"
              description="该验证码无效或证书已被撤销，请核实信息来源。"
              type="error"
              showIcon
              icon={<CloseCircleOutlined />}
              style={{ marginBottom: 24 }}
            />
          )
        )}

        {certificate && (
          <Card title="证书信息" style={{ marginBottom: 24 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="证书编号">{certificate.certificateNo}</Descriptions.Item>
              <Descriptions.Item label="猫咪编号">{certificate.catNo}</Descriptions.Item>
              <Descriptions.Item label="猫咪名称">{certificate.catName}</Descriptions.Item>
              <Descriptions.Item label="猫主人">{certificate.ownerName}</Descriptions.Item>
              <Descriptions.Item label="签发日期">{certificate.issueDate}</Descriptions.Item>
              <Descriptions.Item label="验证码">{certificate.verificationCode}</Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {chainResult && (
          <Card title="区块链存证验证">
            <Space direction="vertical" style={{ width: '100%' }}>
              {chainResult.valid ? (
                <Tag color="green" icon={<CheckCircleOutlined />}>
                  区块链验证通过 - 数据未被篡改
                </Tag>
              ) : (
                <Tag color="red" icon={<CloseCircleOutlined />}>
                  区块链验证失败 - 数据可能已被篡改
                </Tag>
              )}
              <Text type="secondary" style={{ fontSize: 12 }}>
                该猫咪信息已记录在区块链上，所有历史操作可追溯、不可篡改。
              </Text>
              {chainResult.records && chainResult.records.length > 0 && (
                <div>
                  <Text strong>区块记录数：{chainResult.records.length}</Text>
                </div>
              )}
            </Space>
          </Card>
        )}

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <QRCode value={code || 'https://cat-pedigree.com/verify'} size={120} />
          <p style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
            手机扫描二维码可直接访问验证页面
          </p>
        </div>
      </Card>
    </div>
  )
}

export default VerifyPage
