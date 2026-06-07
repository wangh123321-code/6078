import request from '../utils/request'

export const verifyCatOnChain = (catNo) => {
  return request({
    url: `/blockchain/verify/${catNo}`,
    method: 'get',
  })
}

export const getCatChainRecords = (catNo) => {
  return request({
    url: `/blockchain/cat/${catNo}`,
    method: 'get',
  })
}

export const getLatestBlock = () => {
  return request({
    url: '/blockchain/latest',
    method: 'get',
  })
}
