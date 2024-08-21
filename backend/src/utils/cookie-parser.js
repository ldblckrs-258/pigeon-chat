const cookieParser = (cookieString, cookieName) => {
  const cookieArray = cookieString.split(';')
  const cookie = cookieArray.find((cookie) =>
    cookie.trim().startsWith(`${cookieName}=`)
  )
  return cookie ? cookie.split('=')[1] : null
}

export default cookieParser
