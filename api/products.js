// Demo products with prices for all stores
const products = [
  {
    id: 1,
    name: 'Maito 1L',
    category: 'Maito ja Munat',
    unit: '1L',
    prices: {
      'S-Market': { price: 1.29, recorded_at: new Date().toISOString() },
      'Prisma': { price: 1.25, recorded_at: new Date().toISOString() },
      'K-Citymarket': { price: 1.32, recorded_at: new Date().toISOString() },
      'K-Supermarket': { price: 1.28, recorded_at: new Date().toISOString() },
      'Lidl': { price: 1.22, recorded_at: new Date().toISOString() },
      'Alepa': { price: 1.35, recorded_at: new Date().toISOString() }
    }
  },
  {
    id: 2,
    name: 'Banaani 1kg',
    category: 'Hedelmät',
    unit: '1kg',
    prices: {
      'S-Market': { price: 2.15, recorded_at: new Date().toISOString() },
      'Prisma': { price: 1.99, recorded_at: new Date().toISOString() },
      'K-Citymarket': { price: 2.29, recorded_at: new Date().toISOString() },
      'K-Supermarket': { price: 2.19, recorded_at: new Date().toISOString() },
      'Lidl': { price: 2.05, recorded_at: new Date().toISOString() },
      'Alepa': { price: 2.39, recorded_at: new Date().toISOString() }
    }
  },
  {
    id: 3,
    name: 'Jauheliha 400g',
    category: 'Liha',
    unit: '400g',
    prices: {
      'S-Market': { price: 4.49, recorded_at: new Date().toISOString() },
      'Prisma': { price: 4.29, recorded_at: new Date().toISOString() },
      'K-Citymarket': { price: 4.79, recorded_at: new Date().toISOString() },
      'K-Supermarket': { price: 4.59, recorded_at: new Date().toISOString() },
      'Lidl': { price: 3.99, recorded_at: new Date().toISOString() },
      'Alepa': { price: 4.89, recorded_at: new Date().toISOString() }
    }
  },
  {
    id: 4,
    name: 'Ruisleipä 500g',
    category: 'Leipä',
    unit: '500g',
    prices: {
      'S-Market': { price: 2.49, recorded_at: new Date().toISOString() },
      'Prisma': { price: 2.39, recorded_at: new Date().toISOString() },
      'K-Citymarket': { price: 2.69, recorded_at: new Date().toISOString() },
      'K-Supermarket': { price: 2.59, recorded_at: new Date().toISOString() },
      'Lidl': { price: 2.29, recorded_at: new Date().toISOString() },
      'Alepa': { price: 2.79, recorded_at: new Date().toISOString() }
    }
  },
  {
    id: 5,
    name: 'Tomaatti 500g',
    category: 'Vihannekset',
    unit: '500g',
    prices: {
      'S-Market': { price: 2.59, recorded_at: new Date().toISOString() },
      'Prisma': { price: 2.49, recorded_at: new Date().toISOString() },
      'K-Citymarket': { price: 2.79, recorded_at: new Date().toISOString() },
      'K-Supermarket': { price: 2.69, recorded_at: new Date().toISOString() },
      'Lidl': { price: 2.35, recorded_at: new Date().toISOString() },
      'Alepa': { price: 2.89, recorded_at: new Date().toISOString() }
    }
  },
  {
    id: 6,
    name: 'Kananmunat 10kpl',
    category: 'Maito ja Munat',
    unit: '10kpl',
    prices: {
      'S-Market': { price: 2.89, recorded_at: new Date().toISOString() },
      'Prisma': { price: 2.69, recorded_at: new Date().toISOString() },
      'K-Citymarket': { price: 3.09, recorded_at: new Date().toISOString() },
      'K-Supermarket': { price: 2.99, recorded_at: new Date().toISOString() },
      'Lidl': { price: 2.49, recorded_at: new Date().toISOString() },
      'Alepa': { price: 3.19, recorded_at: new Date().toISOString() }
    }
  },
  {
    id: 7,
    name: 'Kahvi 500g',
    category: 'Kahvi ja Tee',
    unit: '500g',
    prices: {
      'S-Market': { price: 5.99, recorded_at: new Date().toISOString() },
      'Prisma': { price: 5.79, recorded_at: new Date().toISOString() },
      'K-Citymarket': { price: 6.29, recorded_at: new Date().toISOString() },
      'K-Supermarket': { price: 6.09, recorded_at: new Date().toISOString() },
      'Lidl': { price: 5.49, recorded_at: new Date().toISOString() },
      'Alepa': { price: 6.49, recorded_at: new Date().toISOString() }
    }
  },
  {
    id: 8,
    name: 'Jogurtti 150g',
    category: 'Maito ja Munat',
    unit: '150g',
    prices: {
      'S-Market': { price: 0.89, recorded_at: new Date().toISOString() },
      'Prisma': { price: 0.85, recorded_at: new Date().toISOString() },
      'K-Citymarket': { price: 0.99, recorded_at: new Date().toISOString() },
      'K-Supermarket': { price: 0.95, recorded_at: new Date().toISOString() },
      'Lidl': { price: 0.79, recorded_at: new Date().toISOString() },
      'Alepa': { price: 1.09, recorded_at: new Date().toISOString() }
    }
  },
  {
    id: 9,
    name: 'Appelsiini 1kg',
    category: 'Hedelmät',
    unit: '1kg',
    prices: {
      'S-Market': { price: 2.49, recorded_at: new Date().toISOString() },
      'Prisma': { price: 2.35, recorded_at: new Date().toISOString() },
      'K-Citymarket': { price: 2.69, recorded_at: new Date().toISOString() },
      'K-Supermarket': { price: 2.59, recorded_at: new Date().toISOString() },
      'Lidl': { price: 2.29, recorded_at: new Date().toISOString() },
      'Alepa': { price: 2.79, recorded_at: new Date().toISOString() }
    }
  },
  {
    id: 10,
    name: 'Porkkana 1kg',
    category: 'Vihannekset',
    unit: '1kg',
    prices: {
      'S-Market': { price: 1.69, recorded_at: new Date().toISOString() },
      'Prisma': { price: 1.59, recorded_at: new Date().toISOString() },
      'K-Citymarket': { price: 1.89, recorded_at: new Date().toISOString() },
      'K-Supermarket': { price: 1.79, recorded_at: new Date().toISOString() },
      'Lidl': { price: 1.49, recorded_at: new Date().toISOString() },
      'Alepa': { price: 1.99, recorded_at: new Date().toISOString() }
    }
  }
];

module.exports = async (req, res) => {
  res.status(200).json(products);
};
