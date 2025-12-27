// Demo stores data
const stores = [
  { id: 1, name: 'S-Market' },
  { id: 2, name: 'Prisma' },
  { id: 3, name: 'K-Citymarket' },
  { id: 4, name: 'K-Supermarket' },
  { id: 5, name: 'Lidl' },
  { id: 6, name: 'Alepa' }
];

module.exports = async (req, res) => {
  res.status(200).json(stores);
};
