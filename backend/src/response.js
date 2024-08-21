/**
 * Middleware để mở rộng response object.
 * @param {object} req - Yêu cầu HTTP.
 * @param {object} res - Phản hồi HTTP.
 * @param {function} next - Hàm callback.
 */
const responseDecorator = (req, res, next) => {
  // Thay đổi status code của phản hồi.
  res.status = (status) => {
    res.statusCode = status
    return res
  }

  // Gửi phản hồi dạng JSON.
  res.json = (data) => {
    res.setHeader('Content-type', 'application/json')
    res.end(JSON.stringify(data))
  }

  // Gửi phản hồi dạng text.
  res.send = async (data) => {
    res.end(data)
  }

  next()
}

export default responseDecorator
