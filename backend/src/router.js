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
   */
  const useAll = (...middlewares) => {
    middlewaresForAll.push(...middlewares)
  }

  /**
   * Đăng ký middleware cho một đường dẫn cụ thể
   * @param {string} path - Đường dẫn.
   * @param {...function} middlewares - Các middleware.
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

  const get = (path, ...handlers) => {
    const middlewaresAndControllers = routes.get(`${path}/GET`) || []
    routes.set(`${path}/GET`, [...middlewaresAndControllers, ...handlers])
  }

  const post = (path, ...handlers) => {
    const middlewaresAndControllers = routes.get(`${path}/POST`) || []
    routes.set(`${path}/POST`, [...middlewaresAndControllers, ...handlers])
  }

  const put = (path, ...handlers) => {
    const middlewaresAndControllers = routes.get(`${path}/PUT`) || []
    routes.set(`${path}/PUT`, [...middlewaresAndControllers, ...handlers])
  }

  const patch = (path, ...handlers) => {
    const middlewaresAndControllers = routes.get(`${path}/PATCH`) || []
    routes.set(`${path}/PATCH`, [...middlewaresAndControllers, ...handlers])
  }

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
