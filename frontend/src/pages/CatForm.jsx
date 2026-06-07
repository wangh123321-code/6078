import React, { useState, useEffect } from 'react'
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Card,
  Space,
  message,
  Typography,
  Row,
  Col,
} from 'antd'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { createCat, updateCat, getCatByNo } from '../api/cat.js'

const { Title } = Typography
const { Option } = Select
const { TextArea } = Input

function CatForm() {
  const navigate = useNavigate()
  const { catNo } = useParams()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const isEdit = !!catNo

  useEffect(() => {
    if (isEdit) {
      loadCatData()
    }
  }, [catNo])

  const loadCatData = async () => {
    try {
      const res = await getCatByNo(catNo)
      const cat = res.data
      form.setFieldsValue({
        ...cat,
        birthDate: cat.birthDate ? dayjs(cat.birthDate) : null,
        registrationDate: cat.registrationDate ? dayjs(cat.registrationDate) : null,
      })
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  }

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const data = {
        ...values,
        birthDate: values.birthDate?.format('YYYY-MM-DD'),
        registrationDate: values.registrationDate?.format('YYYY-MM-DD'),
      }

      if (isEdit) {
        const res = await getCatByNo(catNo)
        await updateCat(res.data.id, data)
        message.success('更新成功')
      } else {
        await createCat(data)
        message.success('创建成功')
      }
      navigate('/cats')
    } catch (error) {
      console.error('保存失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/cats')}>
          返回列表
        </Button>
      </div>

      <div className="page-header">
        <Title level={3} style={{ margin: 0 }}>
          {isEdit ? '编辑猫咪信息' : '新增猫咪'}
        </Title>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ gender: 'MALE' }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="catNo"
                label="猫咪编号"
                rules={[{ required: true, message: '请输入猫咪编号' }]}
              >
                <Input placeholder="请输入猫咪编号" disabled={isEdit} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label="猫咪名称"
                rules={[{ required: true, message: '请输入猫咪名称' }]}
              >
                <Input placeholder="请输入猫咪名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="breed"
                label="品种"
                rules={[{ required: true, message: '请选择品种' }]}
              >
                <Select placeholder="请选择品种">
                  <Option value="英国短毛猫">英国短毛猫</Option>
                  <Option value="美国短毛猫">美国短毛猫</Option>
                  <Option value="布偶猫">布偶猫</Option>
                  <Option value="波斯猫">波斯猫</Option>
                  <Option value="暹罗猫">暹罗猫</Option>
                  <Option value="缅因猫">缅因猫</Option>
                  <Option value="苏格兰折耳猫">苏格兰折耳猫</Option>
                  <Option value="俄罗斯蓝猫">俄罗斯蓝猫</Option>
                  <Option value="孟加拉豹猫">孟加拉豹猫</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="gender"
                label="性别"
                rules={[{ required: true, message: '请选择性别' }]}
              >
                <Select placeholder="请选择性别">
                  <Option value="MALE">公</Option>
                  <Option value="FEMALE">母</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="birthDate"
                label="出生日期"
                rules={[{ required: true, message: '请选择出生日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="color" label="毛色">
                <Input placeholder="请输入毛色" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="eyeColor" label="眼色">
                <Input placeholder="请输入眼色" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="coatPattern" label="被毛图案">
                <Input placeholder="请输入被毛图案" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="microchipNo" label="芯片编号">
                <Input placeholder="请输入芯片编号" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="registrationNo" label="注册编号">
                <Input placeholder="请输入注册编号" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="fatherCatNo" label="父亲编号">
                <Input placeholder="请输入父亲猫咪编号" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="motherCatNo" label="母亲编号">
                <Input placeholder="请输入母亲猫咪编号" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="registrationDate" label="注册日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="备注">
            <TextArea rows={4} placeholder="请输入备注信息" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                {isEdit ? '保存修改' : '提交注册'}
              </Button>
              <Button onClick={() => navigate('/cats')}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default CatForm
