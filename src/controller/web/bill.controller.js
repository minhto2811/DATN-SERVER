const Bill = require("../../model/bill");
const User = require("../../model/user");
const Product = require("../../model/product");
const Cache = require("../../model/Cache");
const Variations = require("../../model/variations");
const Notification = require("../../model/notification");
const PushNotification = require('../../utils/pushNotification')
const Refunds = require('../../model/refunds')



class Controller {
  async list(req, res) {
    try {
      const array = await Bill.find({ status: req.query.status });

      const amount = await Bill.find({ status: 0 });
      const amount2 = await Bill.find({ status: 1 });
      const amount3 = await Bill.find({ status: -1, payment_method: 1, payment_status: 1, refund: 0 });

      for (let i = 0; i < array.length; i++) {
        const data = await User.findById(array[i].userId);

        array[i].username = data.username;

        if (array[i].payment_status != undefined) {
          switch (array[i].payment_status) {
            case 0:
              array[i].statusText = "Chưa thanh toán";
              break;
            case 1:
              array[i].statusText = "Đã thanh toán";
              break;
            default:
              break;
          }
        }


      }
      res.render("bill/viewBill", {
        layout: "layouts/main",
        data: array,
        amount,
        amount2,
        amount3,
        req,
        title: "Hóa đơn"
      });
    } catch (error) {
      res.json(error);
    }
  }

  async detail(req, res) {
    try {
      const id = req.params.id;
      const status = req.params.status;
      const bill = await Bill.findOne({ _id: id, delete: false }).lean();
      if (!bill) throw "Không tìm thấy hóa đơn";

      const data = await User.findById(bill.userId);
      bill.username = data.username;

      if (bill.payment_status != undefined) {
        switch (bill.payment_status) {
          case 0:
            bill.statusText2 = "Chưa thanh toán";
            break;
          case 1:
            bill.statusText2 = "Đã thanh toán";
            break;
          default:
            break;
        }
      }

      if (bill.payment_method != undefined) {
        switch (bill.payment_method) {
          case 0:
            bill.statusText3 = "Thanh toán khi nhận hàng";
            break;
          case 1:
            bill.statusText3 = "Thanh toán online bằng momo";
            break;
          default:
            break;
        }
      }

      if (bill.shipping_method != undefined) {
        switch (bill.shipping_method) {
          case 0:
            bill.statusText4 = "Tiết kiệm";
            break;
          case 1:
            bill.statusText4 = "Nhanh";
            break;
          case 2:
            bill.statusText4 = "Hỏa tốc";
            break;
          default:
            break;
        }
      }

      if (bill.status != undefined) {
        switch (bill.status) {
          case 0:
            bill.statusText = "Chưa được xác nhận";
            break;
          case 1:
            bill.statusText = "Đang giao hàng";
            break;
          case 2:
            bill.statusText = "Đã giao hàng";
            break;
          case -1:
            bill.statusText = "Đơn hàng đã hủy";
            break;
          default:
            break;
        }
      }

      await Promise.all(
        bill.products.map(async (i) => {
          const variations = await Variations.findById(i.variations_id);
          if (variations) {
            i.ram = variations.ram;
            i.rom = variations.rom;
            i.image = variations.image;
            i.color = variations.color;
            i.totoal_price = i.quantity * i.price;
            const product = await Product.findById(variations.productId);
            if (product) i.product_name = product.product_name;
          }
        })
      );

      res.render("bill/detailBill", { layout: "layouts/main", data: bill, title: "Hóa đơn", status });
    } catch (error) {
      res.json(error);
    }
  }

  async canceled(req, res) {
    try {
      const id = req.params.id;
      const bill = await Bill.findById(id);
      let status;

      if (bill.status == 0) {
        status = bill.status
        bill.status = -1;
        await bill.save();
      } else {
        status = bill.status
        bill.status = -1;
        await bill.save();
      }

      let noti = {
        userId: bill.userId,
        title: "Thông báo mới",
        body: `Đơn hàng ${bill._id} đã bị hủy.`,
        image: "https://img.freepik.com/premium-vector/e-tech-logo_110852-50.jpg",
        route: "OrderDetailScreen",
        dataId: bill._id
      }
      await Notification.create(noti)
      PushNotification.sendPushNotification(noti);

      res.redirect(`/bill/?status=${status}`);

      await Promise.all([(async () => {
        bill.products.map(async (item) => {
          const variations = await Variations.findById(item.variations_id)
          if (variations) {
            variations.quantity += item.quantity
            return await variations.save()
          }
        })
      })(),
      (async () => {
        if (bill.payment_method == 1 && bill.payment_status == 1) {
          console.log('chả tiền momo');
          const refunds = {
            userId: bill.userId,
            billId: bill._id,
            price: bill.total_price - bill.transport_fee
          }
          await Refunds.create(refunds)
        }
      })()
      ])

    } catch (error) {
      res.json(error);
    }
  }

  async confirmBill(req, res) {
    try {
      const id = req.params.id;
      const bill = await Bill.findById(id);
      if (bill && bill.status == 0) {
        bill.status = 1;
      } else if (bill && bill.status == 1) {
        bill.status = 2;
        bill.payment_status = 1
      }
      await bill.save();
      res.redirect(`/bill/?status=${bill.status - 1}`);
      const text = bill.status == 1 ? " đang trên đường vận chuyển" : " đã giao thành công"
      let noti = {
        userId: bill.userId,
        title: "Thông báo mới",
        body: `Đơn hàng ${bill._id} ${text}`,
        image: "https://img.freepik.com/premium-vector/e-tech-logo_110852-50.jpg",
        route: "OrderDetailScreen",
        dataId: bill._id
      }
      Notification.create(noti)
      PushNotification.sendPushNotification(noti);
      if (bill.status != 2) return;
      var productSold = []
      await Promise.all(
        bill.products.map(async (item) => {
          const cacheCheck = await Cache.findOne({
            userId: bill.userId,
            variationId: item.variations_id,
          });
          const variations = await Variations.findById(item.variations_id);
          if (cacheCheck) {
            await cacheCheck.deleteOne();
            await Cache.create({
              userId: cacheCheck.userId,
              productId: cacheCheck.productId,
              variationId: cacheCheck.variationId,
            });
          } else {
            await Cache.create({
              userId: bill.userId,
              productId: variations.productId,
              variationId: item.variations_id,
            });
          }
          if (productSold.length == 0) {
            productSold.push({ productId: variations.productId, quantity: item.quantity })
            return
          }

          var check = true
          for (let i = 0; i < productSold.length; i++) {
            if (productSold[i].productId == variations.productId) {
              productSold[i].quantity += item.quantity
              check = false
              break
            }
          }

          if (check) {
            productSold.push({ productId: variations.productId, quantity: item.quantity })
          }
        })
      );

      await Promise.all(productSold.map(async (item) => {
        return await Product.updateOne({ _id: item.productId }, { $set: { sold: item.quantity } })
      }))
    } catch (error) {
      console.log(error);
      res.json(error);
    }
  }

  async refund(req, res) {
    try {

      const refund = await Refunds.findOne({
        billId: req.params.id,
      });
      const bill = await Bill.findById(req.params.id);

      bill.refund = 1;
      await bill.save();


      if (refund && refund.status == 0) {
        refund.status = 1;
        refund.time = new Date();
        await refund.save();
      }

      res.redirect('/bill/?status=-1')


    } catch (error) {
      res.json(error)
    }
  }

  async dashboard(req, res) {
    try {
      let listProduct = await Product.find().sort({ sold: -1 }).limit(5);
      const months = [];
      const totalBills = [];
      const totalBillsProduct = [];
      const totalInterests = [];
      const totalCustomers = [];
      const endDate = new Date();
      const last6Month = new Date(
        endDate.getFullYear(),
        endDate.getMonth() - 5,
        1
      );
      let currentDate = new Date(last6Month);

      while (currentDate <= endDate) {
        let previusDate = currentDate.toISOString();
        let nowDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          1
        ).toISOString();
        let date = currentDate.toLocaleString("vie", {
          month: "long",
          year: "numeric",
        });
        months.push(
          date.substring(0, 1).toLocaleUpperCase() + date.substring(1)
        );
        currentDate.setMonth(currentDate.getMonth() + 1);

        let total = await getTotalBill(previusDate, nowDate);
        let product = await getTotalProduct(previusDate, nowDate);
        let client = await getTotalCustomer(previusDate, nowDate);
        totalBills.push(total);
        totalBillsProduct.push(0 - product);
        totalInterests.push(total - product);
        totalCustomers.push(client);
      }

      res.render("dashBoard/dashboard", {
        layout: "layouts/main",
        title: "Thống kê",
        listProduct: JSON.stringify(listProduct),
        months: JSON.stringify(months),
        totalBills: JSON.stringify(totalBills),
        totalBillsProduct: JSON.stringify(totalBillsProduct),
        totalInterests: JSON.stringify(totalInterests),
        totalCustomers: JSON.stringify(totalCustomers),
      });
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  async dashboardPost(req, res) {
    try {
      let listProduct = await Product.find().sort({ sold: -1 }).limit(5);
      const months = [];
      const totalBills = [];
      const totalBillsProduct = [];
      const totalInterests = [];
      const totalCustomers = [];

      const previusDate = req.body.start_at;
      const nowDate = req.body.expries_at;

      months.push(`${previusDate} - ${nowDate}`);

      let total = await getTotalBill(previusDate, nowDate);
      let product = await getTotalProduct(previusDate, nowDate);
      let client = await getTotalCustomer(previusDate, nowDate);

      totalBills.push(total);
      totalBillsProduct.push(0 - product);
      totalInterests.push(total - product);
      totalCustomers.push(client);

      res.render("dashBoard/dashboard", {
        layout: "layouts/main",
        title: "Thống kê",
        listProduct: JSON.stringify(listProduct),
        months: JSON.stringify(months),
        totalBills: JSON.stringify(totalBills),
        totalBillsProduct: JSON.stringify(totalBillsProduct),
        totalInterests: JSON.stringify(totalInterests),
        totalCustomers: JSON.stringify(totalCustomers),
      });
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }
}

async function getTotalBill(previusDate, nowDate) {
  var match_stage = {
    $match: {
      time: {
        $gte: new Date(previusDate),
        $lte: new Date(nowDate),
      },
      status: {
        $gte: 2,
      },
    },
  };
  var group_stage = {
    $group: { _id: null, sum: { $sum: "$total_price" } },
  };
  var project_stage = {
    $project: { _id: 0, total: "$sum" },
  };

  var pipeline = [match_stage, group_stage, project_stage];
  let sumTotal = await Bill.aggregate(pipeline);
  if (sumTotal[0] != undefined) {
    return sumTotal[0].total;
  } else {
    return 0;
  }
}

async function getTotalProduct(previusDate, nowDate) {
  var match_stage = {
    $match: {
      time: {
        $gte: new Date(previusDate),
        $lte: new Date(nowDate),
      },
      status: {
        $gte: 2,
      },
    },
  };
  var group_stage = {
    $group: { _id: null, sum: { $sum: "$import_total" } },
  };
  var project_stage = {
    $project: { _id: 0, total: "$sum" },
  };

  var pipeline = [match_stage, group_stage, project_stage];
  let sumTotal = await Bill.aggregate(pipeline);
  if (sumTotal[0] != undefined) {
    return sumTotal[0].total;
  } else {
    return 0;
  }
}

async function getTotalCustomer(previusDate, nowDate) {
  let listClient = await User.find({
    time: {
      $gte: previusDate,
      $lte: nowDate,
    },
    role: false
  });
  if (listClient) {
    return listClient.length;
  } else {
    return 0;
  }
}

module.exports = new Controller();
