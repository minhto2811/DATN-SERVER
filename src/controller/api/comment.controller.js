require('dotenv').config()
const Comment = require('../../model/comment')
const Cache = require('../../model/Cache')
const User = require('../../model/user')
const Varitation = require('../../model/variations')
const { uploadImage } = require('../../utils/uploadImage')
class ApiController {
    async getAll(req, res) {
        try {
            const productId = req.params.productId
            const comments = await Comment.find({ productId: productId }).lean()
            if (!comments)
                throw "Không tìm thấy loại sản phẩm"
            await Promise.all(comments.map(async (item) => {
                await Promise.all([
                    (async () => {
                        const user = await User.findOne({ userId: item.userId })
                        if (user) {
                            item.author = {}
                            item.author.fullname = user.fullname
                            item.author.avatar = user.avatar ? user.avatar : "https://firebasestorage.googleapis.com/v0/b/shopping-6b085.appspot.com/o/user%2Fuser.png?alt=media&token=794ad4dc-302b-4708-b102-ccbaf80ea567&_gl=1*e1jpw6*_ga*NDE5OTAxOTY1LjE2OTUwMDQ5MjM.*_ga_CW55HF8NVT*MTY5NzExMzA0MS4yMS4xLjE2OTcxMTMzMjcuNTkuMC4w"
                        }
                    })(),
                    (async () => {
                        const variations = await Varitation.findById(item.varitationId)
                        console.log(variations)
                        if (variations) {
                            item.product = {}
                            item.product.image = variations.image
                            let propety = `Màu sắc: ${variations.color}`
                            if (variations.ram) {
                                propety += `, bộ nhớ ngoài: ${variations.ram}`
                            }
                            if (variations.rom) {
                                propety += `, bộ nhớ trong: ${variations.rom}`
                            }
                            item.product.propety = propety
                        }
                    })(),
                ])
            }))
            res.json(comments)
        } catch (error) {
            console.log(error)
            res.json(error)
        }

    }

    async add(req, res) {
        try {
            const data = req.body
            const cache = await Cache.findOne({ userId: data.userId, productId: data.productId, varitationId: data.varitationId })
            if (!cache) throw "Đã hết thời gian đánh giá sản phẩm"
            const uploadedFiles = req.files
            if (uploadedFiles != null && uploadedFiles.length > 0) {
                data.image = []
                await Promise.all(uploadedFiles.map(async (file) => {
                    const filename = file.filename
                    const filepath = file.path
                    const url = await uploadImage(filepath, filename)
                    data.image.push(url)
                }))
            }
            const comment = await Comment.create(data)
            if (!comment) throw "Đánh giá thất bại"
            await cache.deleteOne()
            res.json(comment)
        } catch (error) {
            console.log(error)
            res.json(error)
        }
    }

    async check(req, res) {
        try {
            const data = req.body
            const cache = await Cache.find({ userId: data.userId, productId: data.productId })
            if (!cache || cache.length == 0) return res.json([])
            const listVariationId = []
            cache.forEach((item) => listVariationId.push(item.varitationId))
            res.json(listVariationId)
        } catch (error) {
            console.log(error)
            res.json(error)
        }
    }

    async test(req, res) {
        try {
            const data = req.body
            const uploadedFiles = req.files
            if (uploadedFiles != null && uploadedFiles.length > 0) {
                data.image = []
                await Promise.all(uploadedFiles.map(async (file) => {
                    const filename = file.filename
                    const filepath = file.path
                    const url = await uploadImage(filepath, filename)
                    data.image.push(url)
                }))
            }
            const comment = await Comment.create(data)
            if (!comment) throw "Đánh giá thất bại"
            res.json(comment)
        } catch (error) {
            console.log(error)
            res.json(error)
        }
    }

    async delete(req, res) {
        try {
            const commentId = req.body.commentId
            const commentDel = await Comment.findByIdAndDelete(commentId)
            if (!commentDel) throw "Không tìm thấy comment"
            res.json({ code: 200, message: "Xóa thành công" })
        } catch (error) {
            console.log(error)
            res.json({ code: 500, message: "Xóa thất bại" })
        }
    }

    async update(req, res) {
        try {
            const data = req.body
            const uploadedFiles = req.files
            if (uploadedFiles != null && uploadedFiles.length > 0) {
                data.image = []
                await Promise.all(uploadedFiles.map(async (file) => {
                    const filename = file.filename
                    const filepath = file.path
                    const url = await uploadImage(filepath, filename)
                    data.image.push(url)
                }))
            }
            const commentUpdate = await Comment.findByIdAndUpdate(data._id, { data })
            if (!commentUpdate) throw "Cập nhật bình luận thất bại"
            res.json({ code: 200, message: "Cập nhật thành công" })
        } catch (error) {
            console.log(error)
            res.json({ code: 500, message: "Cập nhật thất bại" })
        }
    }

}








module.exports = new ApiController