const GymCommunityPost = require("../../models/admin_models/GymCommunityPost")

const getPosts = async (req, res) => {
  try {

    const allDocs = await GymCommunityPost.find()

    if (!allDocs.length)
      return res.status(200).json({ success: true, posts: [] })


    const allPosts = allDocs.flatMap(doc =>
      doc.post.map(p => ({
        ...p.toObject(),
        _id: p._id.toString(),    
        ownerEmail: doc.email
      }))
    )


    const sorted = allPosts.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    )


    res.status(200).json({
      success: true,
      posts: sorted
    })

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    })
  }
}



const addPost = async (req, res) => {
  try {

    const { email } = req.user
    const { title, contents } = req.body

    if (!title || !contents)
      return res.status(400).json({
        message: "Title and contents are required."
      })


    const now = new Date()

    const time = now.toLocaleTimeString("en-PH", {
      hour: "2-digit",
      minute: "2-digit"
    })


    const newPost = {
      title,
      contents,
      date: now,
      time
    }


    let doc = await GymCommunityPost.findOne({ email })

    if (!doc) {

      doc = new GymCommunityPost({
        email,
        post: [newPost]
      })

    } else {

      doc.post.push(newPost)

    }


    await doc.save()

    const saved = doc.post[doc.post.length - 1]


    res.status(201).json({
      success: true,
      post: {
        ...saved.toObject(),
        _id: saved._id.toString(),  
        ownerEmail: email
      }
    })

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    })
  }
}

const editPost = async (req, res) => {

  try {

    const { id } = req.params
    const { title, contents } = req.body


    const docs = await GymCommunityPost.find()

    let targetDoc = null
    let targetPost = null


    for (const doc of docs) {

      const post = doc.post.id(id)

      if (post) {
        targetDoc = doc
        targetPost = post
        break
      }

    }


    if (!targetDoc || !targetPost)
      return res.status(404).json({
        message: "Post not found."
      })


    targetPost.title = title ?? targetPost.title
    targetPost.contents = contents ?? targetPost.contents


    await targetDoc.save()


    res.status(200).json({
      success: true,
      post: {
        ...targetPost.toObject(),
        _id: targetPost._id.toString(), 
        ownerEmail: targetDoc.email
      }
    })

  } catch (error) {

    res.status(500).json({
      message: "Server error",
      error: error.message
    })

  }

}

const deletePost = async (req, res) => {

  try {

    const { id } = req.params

    const docs = await GymCommunityPost.find()

    let targetDoc = null
    let targetPost = null


    for (const doc of docs) {

      const post = doc.post.id(id)

      if (post) {
        targetDoc = doc
        targetPost = post
        break
      }

    }


    if (!targetDoc || !targetPost)
      return res.status(404).json({
        message: "Post not found."
      })


    targetPost.deleteOne()

    await targetDoc.save()


    res.status(200).json({
      success: true,
      message: "Post deleted."
    })

  } catch (error) {

    res.status(500).json({
      message: "Server error",
      error: error.message
    })

  }

}



module.exports = {
  getPosts,
  addPost,
  editPost,
  deletePost
}