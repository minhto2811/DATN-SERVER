const Bill = require("../../model/bill");
const User = require("../../model/user");
const Product = require("../../model/product");
const Cache = require("../../model/Cache");
const Variations = require("../../model/variations");

class Controller {
  async list(req, res) {
    try {
      const array = await Bill.find({ status: req.query.status });

      const amount = await Bill.find({ status: 0 });
      const amount2 = await Bill.find({ status: 1 });

      for (let i = 0; i < array.length; i++) {
        const data = await User.findById(array[i].userId);

        array[i].username = data.username;

        if (array[i].status != undefined) {
          switch (array[i].status) {
            case 0:
              array[i].statusText = "Unconfimred";
              break;
            case 1:
              array[i].statusText = "Delivering";
              break;
            case 2:
              array[i].statusText = "Delivered";
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
        req,
      });
    } catch (error) {
      res.json(error);
    }
  }

  async detail(req, res) {
    try {
      const data = await Bill.findById({ _id: req.params.id });
      res.render("bill/detailBill", { layout: "layouts/main", data: data });
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
      }
      await bill.save();
      res.redirect(`/bill/?status=${bill.status - 1}`);
      if (bill.status != 2) return;
      await Promise.all(
        bill.products.map(async (item) => {
          const cacheCheck = await Cache.findOne({
            userId: bill.userId,
            variationId: item.variations_id,
          });
          if (cacheCheck) {
            await cacheCheck.deleteOne();
            await Cache.create({
              userId: cacheCheck.userId,
              productId: cacheCheck.productId,
              variationId: cacheCheck.variationId,
            });
          } else {
            const variations = await Variations.findById(item.variations_id);
            await Cache.create({
              userId: bill.userId,
              productId: variations.productId,
              variationId: item.variations_id,
            });
          }
        })
      );
    } catch (error) {
      console.log(error);
      res.json(error);
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
        endDate.getMonth() - 4,
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
        let date = currentDate.toLocaleString("en", {
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
        title: "Dashboard",
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

      months.push(`Start ${previusDate} - End ${nowDate}`);

      let total = await getTotalBill(previusDate, nowDate);
      let product = await getTotalProduct(previusDate, nowDate);
      let client = await getTotalCustomer(previusDate, nowDate);

      totalBills.push(total);
      totalBillsProduct.push(0 - product);
      totalInterests.push(total - product);
      totalCustomers.push(client);

      res.render("dashBoard/dashboard", {
        layout: "layouts/main",
        title: "Dashboard",
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
  });
  if (listClient) {
    return listClient.length;
  } else {
    return 0;
  }
}

module.exports = new Controller();
