import fs from 'fs'
import path from 'path'
import multer from 'multer'

// Tạo thư mục lưu file nếu chưa tồn tại
const uploadDirectory = path.resolve('./uploads')
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true })
}

// Cấu hình multer để lưu file vào thư mục "uploads"
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory) // Thư mục lưu file
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname) // Đặt tên file
  }
})

const upload = multer({ storage: storage })

// Hàm xử lý kết nối WebSocket để truyền file
const handleFileTransfer = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected for file transfer')

    // Lắng nghe sự kiện "file-upload" từ client
    socket.on('file-upload', (fileData) => {
      // Lưu file nhận được vào thư mục "uploads"
      const fileBuffer = Buffer.from(fileData.data) // Dữ liệu file dạng buffer
      const filePath = path.join(uploadDirectory, fileData.filename)

      fs.writeFile(filePath, fileBuffer, (err) => {
        if (err) {
          console.error('Error saving file:', err)
          socket.emit('file-upload-error', 'File upload failed.')
        } else {
          console.log('File uploaded successfully:', fileData.filename)
          socket.emit('file-upload-success', {
            message: 'File uploaded successfully!',
            filename: fileData.filename,
            url: `/uploads/${fileData.filename}` // Đường dẫn để truy cập file
          })
        }
      })
    })

    // Xử lý ngắt kết nối
    socket.on('disconnect', () => {
      console.log('A user disconnected from file transfer')
    })
  })
}

export default handleFileTransfer
