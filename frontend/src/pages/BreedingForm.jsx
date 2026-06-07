import React from 'react'
import {
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Card,
  Space,
  message,
  Typography,
  Row,
  Col,
} from 'antd'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { createBreeding } from '../api/breeding.js'

const { Title } = Typography
const { Option } = Select

function BreedingForm() {
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const onFinish = async (values) => {
    try {
      const data = {
        ...values,
        matingDate: values.matingDate?.format('YYYY-MM-DD'),
        expectedDueDate: values.expectedDueDate?.format('YYYY-MM-DD'),
      }
      await createBreeding(data)
      message.success('创建成功')
      navigate('/breedings')
    } catch (error) {
      console.error('保存失败:', error)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/breedings')}>
          返回列表
        </Button>
      </div>

      <div className="page-header">
        <Title level={3} style={{ margin: 0 }}>新增繁育记录</Title>
      </div>

      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="fatherCatNo"
                label="父猫编号"
                rules={[{ required: true, message: '请输入父猫编号' }]}
              >
                <Input placeholder="请输入已注册的父猫编号" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="motherCatNo"
                label="母猫编号"
                rules={[{ required: true, message: '请输入母猫编号' }]}
              >
                <Input placeholder="请输入已注册的母猫编号" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="matingDate"
                label="交配日期"
                rules={[{ required: true, message: '请选择交配日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="status" label="状态">
                <Select placeholder="请选择状态" defaultValue="MATED">
                  <Option value="PENDING">待配种</Option>
                  <Option value="MATED">已交配</Option>
                  <Option value="PREGNANT">已怀孕</Option>
                  <Option value="BORN">已出生</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={4} placeholder="请输入备注信息" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                保存
              </Button>
              <Button onClick={() => navigate('/breedings')}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default BreedingForm
