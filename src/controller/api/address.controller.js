const Province = require('../../model/province')
const Ward = require('../../model/ward')
const District = require('../../model/district')
class ApiController {

    provinces(req, res, next) {
        Province.find()
            .then(nvs => {
                res.json(nvs);
            })
            .catch(err => res.json(err));
    }

    districts(req, res, next) {
        District.find({ parent_code: req.params.parent_code })
            .then(nvs => {
                res.json(nvs);
            })
            .catch(err => res.json(err));
    }

    wards(req, res, next) {
        Ward.find({ parent_code: req.params.parent_code })
            .then(nvs => {
                res.json(nvs);
            })
            .catch(err => res.json(err));
    }


    async pwt(req, res, next) {
        try {
            const path = req.query.path
            console.log(path)
            const ward = await Ward.findOne({ path_with_type: path })
            if (!ward) throw "Không tìm thấy xã phường!"
            const district = await District.findOne({ code: ward.parent_code })
            if (!district) throw "Không tìm thấy quận huyện"
            const province = await Province.findOne({ code: district.parent_code })
            if (!province) throw "Không tìm thấy tỉnh thành phố"
            res.json({ code: 200, data: { province, district, ward } })
        } catch (error) {
            console.log(error)
            res.json({ code: 500, message: error })
        }

    }


}








module.exports = new ApiController;