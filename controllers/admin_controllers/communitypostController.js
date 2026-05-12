const GymCommunityPost = require("../../models/admin_models/GymCommunityPost");

const getPosts = async (req, res) => {
  try {
    const { email } = req.user

    const allDocs = await GymCommunityPost.find()

    if (!allDocs.length) return res.status(200).json({ success: true, posts: [] })
    const allPosts = allDocs.flatMap(doc =>
      doc.post.map(p => ({
        ...p.toObject(),
        ownerEmail: doc.email,
        isOwner: doc.email === email  
      }))
    )

    const sorted = allPosts.sort((a, b) => new Date(b.date) - new Date(a.date))

    res.status(200).json({ success: true, posts: sorted })

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

const addPost = async (req, res) => {
  try {
    const { email } = req.user
    const { title, contents } = req.body

    if (!title || !contents)
      return res.status(400).json({ message: "Title and contents are required." })

    const now = new Date()
    const time = now.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })
    const newPost = { title, contents, date: now, time }

    let doc = await GymCommunityPost.findOne({ email })
    if (!doc) {
      doc = new GymCommunityPost({ email, post: [newPost] })
    } else {
      doc.post.push(newPost)
    }

    await doc.save()
    const saved = doc.post[doc.post.length - 1]

    res.status(201).json({ success: true, post: { ...saved.toObject(), ownerEmail: email, isOwner: true } })

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

const editPost = async (req, res) => {
  try {
    const { email } = req.user
    const { id } = req.params
    const { title, contents } = req.body

    const doc = await GymCommunityPost.findOne({ email })
    if (!doc) return res.status(404).json({ message: "No posts found." })

    const post = doc.post.id(id)
    if (!post) return res.status(404).json({ message: "Post not found." })

    post.title    = title    ?? post.title
    post.contents = contents ?? post.contents

    await doc.save()

    res.status(200).json({ success: true, post: { ...post.toObject(), ownerEmail: email, isOwner: true } })

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

const deletePost = async (req, res) => {
  try {
    const { email } = req.user
    const { id } = req.params
    const doc = await GymCommunityPost.findOne({ email })
    if (!doc) return res.status(404).json({ message: "No posts found." })

    const post = doc.post.id(id)
    if (!post) return res.status(404).json({ message: "Post not found." })

    post.deleteOne()
    await doc.save()

    res.status(200).json({ success: true, message: "Post deleted." })

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

module.exports = { getPosts, addPost, editPost, deletePost }