export const getDb = (key, defaultData) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }
  return JSON.parse(data);
};

export const saveDb = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const initialProducts = [
  {
    id: 1,
    name: "Ergonomic Split Keyboard",
    description: "Split mechanical keyboard for workspace comfort.",
    attributes: [{ name: "Switch", values: ["Blue", "Brown"] }],
    variants: [
      { sku: "ESKB-BLUE", price: 189, stock: 3, attributeValues: { Switch: "Blue" } },
      { sku: "ESKB-BROWN", price: 199, stock: 12, attributeValues: { Switch: "Brown" } }
    ]
  },
  {
    id: 2,
    name: "Minimalist Desk Pad",
    description: "Felt desk mat for mouse and keyboard.",
    attributes: [
      { name: "Size", values: ["Medium", "Large"] },
      { name: "Color", values: ["Grey", "Black"] }
    ],
    variants: [
      { sku: "DPAD-M-GRY", price: 29, stock: 1, attributeValues: { Size: "Medium", Color: "Grey" } },
      { sku: "DPAD-M-BLK", price: 29, stock: 8, attributeValues: { Size: "Medium", Color: "Black" } },
      { sku: "DPAD-L-GRY", price: 39, stock: 4, attributeValues: { Size: "Large", Color: "Grey" } },
      { sku: "DPAD-L-BLK", price: 39, stock: 15, attributeValues: { Size: "Large", Color: "Black" } }
    ]
  },
  {
    id: 3,
    name: "Aluminum Laptop Stand",
    description: "Elevated laptop stand for better neck posture.",
    attributes: [],
    variants: [
      { sku: "LSTAND-AL", price: 49, stock: 25, attributeValues: {} }
    ]
  }
];

export const initialOrders = [
  {
    id: "ORD-1001",
    customerName: "Alice Smith",
    date: "2026-06-21",
    total: 218,
    status: "Delivered",
    items: [
      { name: "Ergonomic Split Keyboard (Blue)", quantity: 1, price: 189 },
      { name: "Minimalist Desk Pad (Medium, Grey)", quantity: 1, price: 29 }
    ]
  },
  {
    id: "ORD-1002",
    customerName: "Bob Jones",
    date: "2026-06-24",
    total: 49,
    status: "Shipped",
    items: [
      { name: "Aluminum Laptop Stand", quantity: 1, price: 49 }
    ]
  },
  {
    id: "ORD-1003",
    customerName: "Charlie Brown",
    date: "2026-06-26",
    total: 78,
    status: "Pending",
    items: [
      { name: "Minimalist Desk Pad (Large, Black)", quantity: 2, price: 39 }
    ]
  },
  {
    id: "ORD-1004",
    customerName: "David Miller",
    date: "2026-06-27",
    total: 228,
    status: "Pending",
    items: [
      { name: "Ergonomic Split Keyboard (Brown)", quantity: 1, price: 199 },
      { name: "Minimalist Desk Pad (Medium, Grey)", quantity: 1, price: 29 }
    ]
  }
];

export const initialCoupons = [
  { id: 1, code: "WELCOME10", type: "Percentage", value: 10, active: true },
  { id: 2, code: "FREESHIP", type: "Fixed", value: 15, active: true },
  { id: 3, code: "SUMMER25", type: "Percentage", value: 25, active: false }
];

export const initialShipping = [
  { id: 1, name: "Domestic Standard", region: "United States", cost: 5.99 },
  { id: 2, name: "Europe Economy", region: "UK, Germany, France", cost: 14.99 },
  { id: 3, name: "Asia Express", region: "Japan, Australia, Singapore", cost: 24.99 }
];
