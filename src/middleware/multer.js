import multer from 'multer'
import fs from 'fs'
export const fileTypes = {
    image: [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/svg+xml',
        'image/bmp',
        'image/tiff',
        'image/x-icon'
    ],
    animatedImage: [
        'image/gif',
        'image/apng'
    ],
    video: [
        'video/mp4',
        'video/x-msvideo',
        'video/x-matroska',
        'video/quicktime',
        'video/x-flv',
        'video/webm'
    ],
    audio: [
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'audio/aac',
        'audio/flac'
    ],
    document: [
        'application/pdf',
    ],
    archive: [
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        'application/gzip'
    ],
    code: [
        'text/html',
        'text/css',
        'application/javascript',
        'application/json',
        'application/xml'
    ]
};


export const multerLocal = (customValidation = [], custiomPath , maxSize = 2 * 1024 * 1024) => {
    const fullPath = `temp/${custiomPath}`
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath , { recursive: true })
    }
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, `${fullPath}`)
        },
        filename: (req, file, cb) => {
            if (customValidation.includes(file.mimetype)) {
                cb(null, file.originalname);
            } else {
                cb(new Error('invaled file type', false))
            }
        }
    })
    const upload = multer({
         storage,
         limits: { fileSize: maxSize }
         })
    return upload
}

export const multerCloud = (customValidation = [], maxSize = 3 * 1024 * 1024) => {
    const storage = multer.diskStorage({});     
    function fileFilter(req, file, cb) {
        if (customValidation.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type: " + file.mimetype), false);
        }
    }
    return multer({
        storage,
        limits: { fileSize: maxSize },
        fileFilter
    });
};

