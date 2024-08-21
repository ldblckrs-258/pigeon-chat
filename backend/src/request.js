import { match } from 'path-to-regexp'

/**
 * Middleware để trích xuất các tham số và truy vấn từ URL và gán chúng vào request.params và request.query.
 * @param {Array} routes - Các route đã đăng ký.
 * @param {object} req - Yêu cầu HTTP.
 * @param {object} res - Phản hồi HTTP.
 * @param {function} next - Hàm callback.
 * @returns {void}
 */
const requestDecorator = (routes, req, res, next) => {
  /**
   * Lấy các tham số từ URL và gán chúng vào req.params.
   */
  const getParams = () => {
    const urlParams = req.url.split('/').slice(1)
    const [lastParam] = urlParams[urlParams.length - 1].split('?')
    urlParams.splice(urlParams.length - 1, 1)
    const allParams = [...urlParams, lastParam].join('/')

    for (const path of routes) {
      const urlMatch = match(path, {
        decode: decodeURIComponent
      })
      const url = `/${allParams}/${req.method.toUpperCase()}`
      const found = urlMatch(url)
      if (found) {
        Object.keys(found.params).forEach((key) => {
          req.params = {
            ...req.params,
            [key]: found.params[key]
          }
        })
        break
      }
    }
  }

  /**
   * Lấy các tham số truy vấn từ URL và gán chúng vào req.query.
   */
  const getQuery = () => {
    const urlParams = req.url.split('/').slice(1)

    const [lastParam, queryString] = urlParams[urlParams.length - 1].split('?')
    let params = new URLSearchParams(queryString)
    let entries = params.entries()

    req.query = {
      ...req.query,
      ...Object.fromEntries(entries)
    }
  }

  getParams()
  getQuery()
  next()
}

export default requestDecorator
