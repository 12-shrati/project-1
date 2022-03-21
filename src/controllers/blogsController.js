const blogsModel = require("../models/blogsModel")
const authorModel = require('../models/authorModel')
const { default: mongoose } = require("mongoose")

const isValid = function (value) {
  if (typeof value === 'undefined' || value === null) return false
  if (typeof value === 'string' && value.trim().length === 0) return false
  return true;
}

const isValidRequestBody = function (author) {
  return Object.keys(author).length > 0
}

const isValidObjectId = function (ObjectId) {
  return mongoose.Types.ObjectId.isValid(ObjectId)
}




const createBlogs = async function (req, res) {
  try {
    var data = req.body

    if (!isValidRequestBody(data)) {
      return res.status(400).send({ status: false, msg: "Invalid request parameters" })
    }

    const { title, body, authorId, tags, catogory, subCatogory, isPublished } = data
    if (!isValid(title)) {
      return res.status(400).send({ status: false, message: "blog title is required" })
    }

    if (!isValid(body)) {
      return res.status(400).send({ status: false, message: "blog body is required" })
    }

    if (!isValid(authorId)) {
      return res.status(400).send({ status: false, message: "author id is required" })
    }

    if (!isValid(tags)) {
      return res.status(400).send({ status: false, message: "blog tags is required" })
    }

    if (!isValid(catogory)) {
      return res.status(400).send({ status: false, message: " blog category is required" })
    }
    const blogData = {
      title,
      body,
      authorId,
      catogory,
      isPublished: isPublished ? isPublished : false,
      publishedAt: isPublished ? new Date() : null
    }

    if (tags) {
      if (Array.isArray(tags)) {
        blogData['tags'] = [...tags]
      }
      if (Object.prototype.toString.call(tags) === "[object String]") {
        blogData['tags'] = [tags]
      }
    }

    if (subCatogory) {
      if (Array.isArray(subCatogory)) {
        blogData['subCatogory'] = [...subCatogory]
      }
      if (Object.prototype.toString.call(subCatogory) === "[object String]") {
        blogData['subCatogory'] = [subCatogory]
      }
    }

    let saveData = await blogsModel.create(blogData)
    res.status(201).send({ status: true, message: "new blog created successfully", data: saveData })
  }
  catch (error) {
    res.status(500).send({ msg: error.message })
  }
}





let getBlogs = async function (req, res) {
  try {
    const filteredQuery = { isDeleted: false, deletedAt: null, isPublished: true }
    const queryParams = req.query

    if (isValidRequestBody(queryParams)) {
      const { authorId, catogory, tags, subCatogory } = queryParams


      if (isValid(authorId) && isValidObjectId(authorId)) {
        filteredQuery['authorId'] = authorId
      }

      if (isValid(catogory)) {
        filteredQuery['catogory'] = catogory.trim()
      }

      if (isValid(tags)) {
        const tagArr = tags.trim().split(',').map(tag => tag.trim())
        filteredQuery['tags'] = { $all: tagArr }
      }

      if (isValid(subCatogory)) {
        const subCatArr = subCatogory.trim().split(',').map(subcat => subcat.trim())
        filteredQuery['subCatogory'] = { $all: subCatArr }
      }
    }
    let blogDetails = await blogsModel.find(filteredQuery)
    if (Array.isArray(blogDetails) && blogDetails.length === 0) {
      res.status(404).send({ status: false, message: "no blog exist" })
    }

    return res.status(200).send({ status: true, message: "blogs list", data: blogDetails })
  }

  catch (error) {
    res.status(500).send({ msg: error.message })
  }
}




const updateBlog = async function (req, res) {
  try {

    let data = req.body
    const params = req.params
    let blogId = params.blogId
    const authorIdFromToken = req.authorId

    if (!isValidObjectId(blogId)) {
      return res.status(400).send({ status: false, message: `${blogId}  is not valid blog id` })
    }

    if (!isValidObjectId(authorIdFromToken)) {
      return res.status(400).send({ status: false, message: `${authorIdFromToken}  is not valid token id` })
    }


    let blogDetails = await blogsModel.findOne({ _id: blogId, isDeleted: false, deletedAt: null })
    if (!blogDetails) {
      res.status(404).send({ status: false, msg: "blog not exist" })
    }
    if (blogDetails.authorId.toString() !== authorIdFromToken) {
      res.status(401).send({ status: false, message: "Unathorized access!" })
    }

    if (!isValidRequestBody(data)) {
      return res.status(400).send({ status: false, msg: "Invalid request parameters" })
    }

    const { title, body, tags, catogory, subCatogory, isPublished } = data
    const updatedBlog = {}
    if (isValid(title)) {
      if (!Object.prototype.hasOwnProperty.call(updatedBlog, '$set')) updatedBlog['$set'] = {}
      updatedBlog['$set']['title'] = title
    }

    if (isValid(body)) {
      if (!Object.prototype.hasOwnProperty.call(updatedBlog, '$set')) updatedBlog['$set'] = {}
      updatedBlog['$set']['body'] = body
    }

    if (isValid(catogory)) {
      if (!Object.prototype.hasOwnProperty.call(updatedBlog, '$set')) updatedBlog['$set'] = {}
      updatedBlog['$set']['catogory'] = catogory
    }

    if (isPublished !== undefined) {
      if (!Object.prototype.hasOwnProperty.call(updatedBlog, '$set')) updatedBlog['$set'] = {}
      updatedBlog['$set']['isPublished'] = isPublished
      updatedBlog['$set']['publishedAt'] = isPublished ? new Date() : null
    }

    if (tags) {
      if (!Object.prototype.hasOwnProperty.call(updatedBlog, '$addToSet')) updatedBlog['$addToSet'] = {}
      if (Array.isArray(tags)) {
        updatedBlog['$addToSet']['tags'] = { $each: [...tags] }
      }
      if (typeof tags === "string") {
        updatedBlog['$addToSet']['tags'] = tags
      }
    }


    if (subCatogory) {
      if (!Object.prototype.hasOwnProperty.call(updatedBlog, '$addToSet')) updatedBlog['$addToSet'] = {}
      if (Array.isArray(subCatogory)) {
        updatedBlog['$addToSet']['subCatogory'] = { $each: [...subCatogory] }
      }
      if (typeof subCatogory === "string") {
        updatedBlog['$addToSet']['subCatogory'] = subCatogory
      }
    }

    const updateBlogDetails = await blogsModel.findOneAndUpdate({ _id: blogId }, updatedBlog, { new: true })
    res.status(201).send({ status: true, message: "blog updated successfully", data: updateBlogDetails })
  }


  catch (error) {
    console.log(error)
    res.send({ msg: error.message })
  }
}





const deleteBlog = async function (req, res) {
  try {
    let blogId = req.params.blogId
    const authorIdFromToken = req.authorId

    if (!isValidObjectId(blogId)) {
      return res.status(400).send({ status: false, message: `${blogId}  is not valid blog id` })
    }

    if (!isValidObjectId(authorIdFromToken)) {
      return res.status(400).send({ status: false, message: `${authorIdFromToken}  is not valid token id` })
    }


    let blog = await blogsModel.findOne({ _id: blogId, isDeleted: false, deletedAt: null })
    if (!blog) {
      res.status(404).send({ status: false, msg: "blog not exist" })
    }

    if (blog.authorId.toString() !== authorIdFromToken) {
      res.status(401).send({ status: false, message: "Unathorized access!" })
    }
    await blogsModel.findOneAndUpdate({ _id: blogId }, { $set: { isDeleted: true, deletedAt: new Date() } })
    res.status(200).send({ status: true, message: "blog deleted successfully" })
    console.log(blog)
  }

  catch (error) {
    console.log(error)
    res.send({ msg: error.message })
  }
}






const deleteByQuery = async function (req, res) {
  try {
    const filterQuery = { isDeleted: false, deletedAt: null }
    let queryParams = req.query
    const authorIdFromToken = req.authorId

    if (!isValidObjectId(authorIdFromToken)) {
      return res.status(400).send({ status: false, message: `${authorIdFromToken}  is not valid token id` })
    }

    if (!isValidRequestBody(queryParams)) {
      return res.status(400).send({ status: false, message: "no query params received" })
    }

    const { authorId, catogory, tags, subCatogory, isPublished } = queryParams


    if (isValid(authorId) && isValidObjectId(authorId)) {
      filterQuery['authorId'] = authorId
    }

    if (isValid(catogory)) {
      filterQuery['catogory'] = catogory.trim()
    }

    if (isValid(isPublished)) {
      filterQuery['isPublished'] = isPublished
    }

    if (isValid(tags)) {
      const subTagArr = tags.trim().split(',').map(subtag => subtag.trim())
      filterQuery['tags'] = { $all: subTagArr }
    }

    if (isValid(subCatogory)) {
      const subcatArr = tags.trim().split(',').map(subcat => subcat.trim())
      filterQuery['subCatogory'] = { $all: subcatArr }
    }


    let blogs = await blogsModel.find(filterQuery)

    if (Array.isArray(blogs) && blogs.length === 0) {
      return res.status(404).send({ status: false, msg: "blog not exist" })
    }


    const blogsDelete = blogs.map(blog => {
      if (blog.authorId.toString() === authorIdFromToken) return blog._id
    })
    if (blogsDelete.length === 0) {
      return res.status(404).send({ status: false, message: "no blog found" })
    }


    await blogsModel.updateMany({ _id: { $in: blogsDelete } }, { $set: { isDeleted: true, deletedAt: new Date() } })
    res.status(200).send({ status: true, message: "blogs deleted successfully" })

  }


  catch (error) {
    console.log(error)
    res.send({ msg: error.message })
  }
}




module.exports.createBlogs = createBlogs
module.exports.getBlogs = getBlogs
module.exports.updateBlog = updateBlog
module.exports.deleteBlog = deleteBlog
module.exports.deleteByQuery = deleteByQuery
