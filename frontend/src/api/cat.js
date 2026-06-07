import request from '../utils/request'

export const createCat = (data) => {
  return request({
    url: '/cats',
    method: 'post',
    data,
  })
}

export const updateCat = (id, data) => {
  return request({
    url: `/cats/${id}`,
    method: 'put',
    data,
  })
}

export const getCatByNo = (catNo) => {
  return request({
    url: `/cats/${catNo}`,
    method: 'get',
  })
}

export const getCatById = (id) => {
  return request({
    url: `/cats/id/${id}`,
    method: 'get',
  })
}

export const getCats = (params) => {
  return request({
    url: '/cats',
    method: 'get',
    params,
  })
}

export const searchCats = (keyword) => {
  return request({
    url: '/cats/search',
    method: 'get',
    params: { keyword },
  })
}

export const getPedigree = (catNo, generations = 5) => {
  return request({
    url: `/cats/pedigree/${catNo}`,
    method: 'get',
    params: { generations },
  })
}

export const getOffspring = (id) => {
  return request({
    url: `/cats/${id}/offspring`,
    method: 'get',
  })
}

export const addAward = (id, data) => {
  return request({
    url: `/cats/${id}/awards`,
    method: 'post',
    data,
  })
}

export const deleteCat = (id) => {
  return request({
    url: `/cats/${id}`,
    method: 'delete',
  })
}
