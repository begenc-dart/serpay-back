const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { Products, Stock } = require('../../models');

exports.getMyCart = catchAsync(async (req, res, next) => {
  const { carts } = req.body;
  var updated_carts = [];

  for (var i = 0; i < carts.length; i++) {
    const product = await Products.findOne({
      where: { product_id: carts[i].product_id },
    });

    if (!product) {
      return next(
        new AppError(`Product did not found with your ID index: ${i + 1}`, 400)
      );
    }

    const stock = await Stock.findOne({
      where: { productId: product.id },
    });

    if (stock.stock_quantity > 0) {
      var quantity;
      if (stock.stock_quantity > carts[i].quantity)
        quantity = carts[i].quantity;
      else quantity = stock.stock_quantity;

      updated_carts.push({
        product_id: carts[i].product_id,
        quantity: quantity,
      });
    }
  }

  return res.status(200).send(updated_carts);
});
