export const getHome = (req, res) => {
  res.status(200).json({ message: 'Welcome to the home page' })
}

export const postHome = (req, res) => {
  try {
    const name = req.body?.name
    const age = req.body?.age + 1

    if (!name || !age) {
      res.status(400).json({ message: 'Name and age are required' })
      return
    }

    res.status(200).json({ name, age })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
