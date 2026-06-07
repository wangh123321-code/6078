import request from '../utils/request'

export const generateCertificate = (catId) => {
  return request({
    url: `/certificates/cat/${catId}`,
    method: 'post',
  })
}

export const getCertificate = (certificateNo) => {
  return request({
    url: `/certificates/${certificateNo}`,
    method: 'get',
  })
}

export const verifyCertificate = (code) => {
  return request({
    url: '/certificates/verify',
    method: 'get',
    params: { code },
  })
}

export const downloadCertificate = (certificateNo) => {
  window.open(`/api/certificates/${certificateNo}/download`)
}
