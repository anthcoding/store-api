const Product = require('../models/product');

const gettAllProductsStatic = async (req, res) => {
  const products = await Product.find({}).sort('-name, -price').select('name price').skip(1);
  res.status(200).json({ products, nbHits: products.length });
};

const gettAllProducts = async (req, res) => {
  const { featured, company, name, sort, fields, numericFilters } = req.query;
  const queryObject = {};
  const defaultLimit = 10;

  if (featured) {
    queryObject.featured = featured === 'true' ? true : false;
  }

  if (company) {
    queryObject.company = company;
  }

  if (name) {
    queryObject.name = { $regex: name, $options: 'i' };
  }

  if (numericFilters) {
    const operatorMap = {
      '>': '$gt',
      '>=': '$gte',
      '=': '$eq',
      '<': '$lt',
      '<=': '$lte',
    };

    const regEx = /\b(<|>|>=|=|<|<=)\b/g;
    let filters = numericFilters.replace(regEx, (match) => `-${operatorMap[match]}-`);
    const options = ['price', 'rating'];
    const splitFilters = filters.split(',');
    splitFilters.forEach((item) => {
      const [field, operator, value] = item.trim().split('-');
      if (options.includes(field)) {
        queryObject[field] = { [operator]: Number(value) };
        console.log(queryObject);
      }
    });
  }

  console.log(queryObject);
  let result = Product.find(queryObject);

  if (sort) {
    result = result.sort(sort);
  } else {
    result = result.sort('-createdAt');
  }

  if (fields) {
    const fieldsList = fields.split(',').join(' ');
    result = result.select(fieldsList);
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || defaultLimit;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const products = await result;

  res.status(200).json({ products, nbHits: products.length });
};

module.exports = { gettAllProductsStatic, gettAllProducts };
