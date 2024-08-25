const Router = () => {
  const routes = new Map()
  const middlewaresForAll = []

  /**
   * Lấy tất cả các route đã đăng ký.
   * @returns {Map} - Map chứa các route đã đăng ký.
   */
  const getRoutes = () => {
    return routes
  }

  /**
   * Lấy tất cả các middleware áp dụng cho tất cả các route.
   * @returns {Array} - Mảng chứa các middleware.
   */
  const getMiddlewaresForAll = () => {
    return middlewaresForAll
  }

  /**
   * Đăng ký middleware cho tất cả các route.
   * @param {...function} middlewares - Các middleware.
   * @example app.useAll(authMiddleware)
   */
  const useAll = (...middlewares) => {
    middlewaresForAll.push(...middlewares)
  }

  /**
   * Đăng ký middleware cho một đường dẫn cụ thể
   * @param {string} path - Đường dẫn.
   * @param {...function} middlewares - Các middleware.
   * @example app.use('/users', authMiddleware, getUsers)
   */
  const use = (path, ...middlewares) => {
    const possiblePaths = [
      path + '/GET',
      path + '/POST',
      path + '/PUT',
      path + '/PATCH',
      path + '/DELETE'
    ]
    possiblePaths.forEach((route) => {
      const middlewaresAndControllers = routes.get(route) || []

      if (middlewaresAndControllers.length) {
        routes.set(route, [...middlewares, ...middlewaresAndControllers])
      }
    })
  }

  /**
   * Đăng ký GET handler cho một đường dẫn cụ thể.
   * @param {string} path - Đường dẫn.
   * @param {...function} handlers - Các handler.
   * @example app.get('/users', getUsers)
   */
  const get = (path, ...handlers) => {
    const middlewaresAndControllers = routes.get(`${path}/GET`) || []
    routes.set(`${path}/GET`, [...middlewaresAndControllers, ...handlers])
  }

  /**
   * Đăng ký POST handler cho một đường dẫn cụ thể.
   * @param {string} path - Đường dẫn.
   * @param {...function} handlers - Các handler.
   * @example app.post('/users', createUser)
   */
  const post = (path, ...handlers) => {
    const middlewaresAndControllers = routes.get(`${path}/POST`) || []
    routes.set(`${path}/POST`, [...middlewaresAndControllers, ...handlers])
  }

  /**
   * Đăng ký PUT handler cho một đường dẫn cụ thể.
   * @param {string} path - Đường dẫn.
   * @param {...function} handlers - Các handler.
   * @example app.put('/users', authMiddleware, updateUser)
   */
  const put = (path, ...handlers) => {
    const middlewaresAndControllers = routes.get(`${path}/PUT`) || []
    routes.set(`${path}/PUT`, [...middlewaresAndControllers, ...handlers])
  }

  /**
   * Đăng ký PATCH handler cho một đường dẫn cụ thể.
   * @param {string} path - Đường dẫn.
   * @param {...function} handlers - Các handler.
   * @example app.patch('/users', authMiddleware, updateUser)
   */
  const patch = (path, ...handlers) => {
    const middlewaresAndControllers = routes.get(`${path}/PATCH`) || []
    routes.set(`${path}/PATCH`, [...middlewaresAndControllers, ...handlers])
  }

  /**
   * Đăng ký DELETE handler cho một đường dẫn cụ thể.
   * @param {string} path - Đường dẫn.
   * @param {...function} handlers - Các handler.
   * @example app.del('/users', authMiddleware, deleteUser)
   */
  const del = (path, ...handlers) => {
    const middlewaresAndControllers = routes.get(`${path}/DELETE`) || []
    routes.set(`${path}/DELETE`, [...middlewaresAndControllers, ...handlers])
  }

  return {
    get,
    post,
    put,
    patch,
    del,
    use,
    useAll,
    getRoutes,
    getMiddlewaresForAll
  }
}

export default Router
