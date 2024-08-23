import { createServer } from 'http'
import { match } from 'path-to-regexp'
import requestDecorator from './request.js'
import responseDecorator from './response.js'
import dns from 'dns'
import os from 'os'

const App = () => {
  const routes = new Map()
  const createMyServer = () => createServer(serverHandler.bind(this))
  const middlewaresForAll = []

  /**
   * Đăng ký middleware cho một đường dẫn cụ thể và các phương thức HTTP.
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

  /**
   * Đăng ký middleware cho tất cả các đường dẫn.
   * @param {...function} middlewares - Các middleware.
   */
  const useAll = (...middlewares) => {
    middlewaresForAll.push(...middlewares)
  }

  /**
   * Đăng ký router cho một đường dẫn cụ thể.
   * @param {string} path - Đường dẫn.
   * @param {object} router - Router.
   */
  const useRouter = (path, router) => {
    const routerRoutes = router.getRoutes()
    const middlewaresFromRouter = router.getMiddlewaresForAll()
    const existentHandlers = routes.get(path) || []
    routerRoutes.forEach((middlewares, key) => {
      routes.set(`${path + key}`, [
        ...existentHandlers,
        ...middlewaresFromRouter,
        ...middlewares
      ])
    })
  }

  /**
   * Đăng ký handler cho phương thức GET.
   * @param {string} path - Đường dẫn.
   * @param {...function} handlers - Các handler.
   */
  const get = (path, ...handlers) => {
    const currentHandlers = routes.get(`${path}/GET`) || []
    routes.set(`${path}/GET`, [...currentHandlers, ...handlers])
  }

  /**
   * Đăng ký handler cho phương thức POST.
   * @param {string} path - Đường dẫn.
   * @param {...function} handlers - Các handler.
   */
  const post = (path, ...handlers) => {
    const currentHandlers = routes.get(`${path}/POST`) || []
    routes.set(`${path}/POST`, [...currentHandlers, ...handlers])
  }

  /**
   * Đăng ký handler cho phương thức PUT.
   * @param {string} path - Đường dẫn.
   * @param {...function} handlers - Các handler.
   */
  const put = (path, ...handlers) => {
    const currentHandlers = routes.get(`${path}/PUT`) || []
    routes.set(`${path}/PUT`, [...currentHandlers, ...handlers])
  }

  /**
   * Đăng ký handler cho phương thức PATCH.
   * @param {string} path - Đường dẫn.
   * @param {...function} handlers - Các handler.
   */
  const patch = (path, ...handlers) => {
    const currentHandlers = routes.get(`${path}/PATCH`) || []
    routes.set(`${path}/PATCH`, [...currentHandlers, ...handlers])
  }

  /**
   * Đăng ký handler cho phương thức DELETE.
   * @param {string} path - Đường dẫn.
   * @param {...function} handlers - Các handler.
   */
  const del = (path, ...handlers) => {
    const currentHandlers = routes.get(`${path}/DELETE`) || []
    routes.set(`${path}/DELETE`, [...currentHandlers, ...handlers])
  }

  /**
   * Thực thi chuỗi middleware.
   * @param {object} req - Yêu cầu HTTP.
   * @param {object} res - Phản hồi HTTP.
   * @param {Array} middlewares - Các middleware.
   * @returns {Promise}
   */
  const dispatchChain = (req, res, middlewares) => {
    return invokeMiddlewares(req, res, middlewares)
  }

  /**
   * Gọi các middleware tuần tự.
   * @param {object} req - Yêu cầu HTTP.
   * @param {object} res - Phản hồi HTTP.
   * @param {Array} middlewares - Các middleware.
   * @returns {Promise}
   */
  const invokeMiddlewares = async (req, res, middlewares) => {
    if (!middlewares.length) return

    const currentMiddleware = middlewares[0]

    return currentMiddleware(req, res, async () => {
      await invokeMiddlewares(req, res, middlewares.slice(1))
    })
  }

  /**
   * Chuẩn hóa URL và phương thức HTTP.
   * @param {string} url - URL.
   * @param {string} method - Phương thức HTTP.
   * @returns {string} - URL đã chuẩn hóa.
   */
  const sanitizeUrl = (url, method) => {
    const urlParams = url.split('/').slice(1)

    const [lastParam] = urlParams[urlParams.length - 1].split('?')
    urlParams.splice(urlParams.length - 1, 1)

    const allParams = [...urlParams, lastParam].join('/')
    const sanitizedUrl = `/${allParams}/${method.toUpperCase()}`

    return sanitizedUrl
  }

  /**
   * Tìm URL khớp với các route đã đăng ký.
   * @param {string} sanitizedUrl - URL đã chuẩn hóa.
   * @returns {string|boolean} - Đường dẫn khớp hoặc false nếu không tìm thấy.
   */
  const matchUrl = (sanitizedUrl) => {
    for (const path of routes.keys()) {
      const urlMatch = match(path, {
        decode: decodeURIComponent
      })

      const found = urlMatch(sanitizedUrl)

      if (found) {
        return path
      }
    }
    return false
  }

  /**
   * Xử lý yêu cầu HTTP.
   * @param {object} req - Yêu cầu HTTP.
   * @param {object} res - Phản hồi HTTP.
   */
  const serverHandler = async (req, res) => {
    const sanitizedUrl = sanitizeUrl(req.url, req.method)

    const match = matchUrl(sanitizedUrl)

    if (match) {
      const middlewaresAndControllers = routes.get(match)
      await dispatchChain(req, res, [
        requestDecorator.bind(null, routes.keys()),
        responseDecorator,
        ...middlewaresForAll,
        ...middlewaresAndControllers
      ])
    } else {
      res.statusCode = 404
      res.end('Endpoint not found')
    }
  }

  /**
   * Khởi chạy server trên cổng chỉ định.
   * @param {number} port - Cổng.
   */
  const run = (port) => {
    const server = createMyServer()
    server.listen(port, () => {
      console.log(`Local: http://localhost:${port}`)
      dns.lookup(os.hostname(), { family: 4 }, (err, address) => {
        if (err) {
          console.error(err)
          return
        }
        console.log(`Network: http://${address}:${port}`)
      })
    })
  }

  return {
    run,
    get,
    post,
    patch,
    put,
    del,
    use,
    useAll,
    useRouter
  }
}

export default App
