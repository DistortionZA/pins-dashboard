export type ReferenceItem = {
  id: string
  title: string
  category: string
  body: string
  warning?: string
}

export const referenceItems: ReferenceItem[] = [
  {
    id: "pk-uk-billing",
    title: "Pins & Knuckles UK Billing Information",
    category: "Billing",
    body: `Pins & Knuckles Clothing Ltd
73 Main Road
Queenborough
Kent
ME11 5DJ
United Kingdom`,
  },
  {
    id: "ramsgate-warehouse",
    title: "Ramsgate Warehouse Delivery Address",
    category: "Delivery",
    body: `Pins & Knuckles Merch
Unit 5, The Old Timber Yard
Manston Road
Ramsgate
Kent
CT12 6HJ
United Kingdom`,
  },
  {
    id: "margate-warehouse",
    title: "Margate Warehouse Address",
    category: "Delivery",
    body: `Premier House,
82 Sweyn Road
Margate
Kent
CT9 2DD
United Kingdom`,
  },
  {
    id: "uk-imports",
    title: "Corporate Information for UK Imports",
    category: "Imports",
    body: `The Embroidered and Printed Clothing Company
Premier House, 82 Sweyn Road
Margate
Kent
CT9 2DD
UNITED KINGDOM
EORI Number: GB995260876000`,
  },
  {
    id: "hungary-warehouse",
    title: "Hungary Warehouse Delivery Address",
    category: "Delivery",
    body: `Soroksári út 110-112, E épület, 2. emelet
1095 Budapest
Hungary`,
  },
  {
    id: "hungary-imports",
    title: "Hungary Corporate Information for EU Imports",
    category: "Imports",
    body: `Sportimadok.hu kft
Hungary, Budapest, Sasadi ut 145
Post Code: 1112
EORI Number: HU0044897613
VAT Number: HU25464807`,
    warning: "THESE NUMBERS ARE NOT TO BE USED FOR INTRA-COMPANY TAX WITHIN THE EU. IMPORTS ONLY.",
  },
]

export default referenceItems
