import request from '../utils/request'

export const importCats = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/excel/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const exportCats = (catIds) => {
  const params = catIds ? { catIds } : {}
  const queryString = new URLSearchParams(params).toString()
  window.open(`/api/excel/export?${queryString}`)
}

export const downloadTemplate = () => {
  window.open('/api/excel/template')
}
