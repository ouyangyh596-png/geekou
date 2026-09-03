import { englishSiteContent } from './site-content.js'

export const companyProfile = englishSiteContent.company

export const capabilities = englishSiteContent.technology.capabilities.map(({ name, description }, index) => [
  String(index + 1).padStart(2, '0'),
  name,
  description
])

export const contactDetails = {
  factoryName: 'ZHEJIANG SO-FINE SELF-ADHESIVE PRODUCTS CO., LTD.',
  factoryAddress: 'No. 99 Wufu Road, Tianzihu Modern Industrial Park, Anji County, Zhejiang, China',
  salesName: 'NINGBO SO-FINE IMPORT AND EXPORT CO., LTD.',
  salesAddress: 'Block 66, No. 31 West Hongtang Road, Hongtang Town, Jiangbei District, Ningbo, Zhejiang, P.R. China 315033',
  phones: ['+86-574-8716-7701', '+86-574-8716-7702'],
  fax: '+86-574-8716-7703',
  email: 'admin@so-fine.com.cn'
}
