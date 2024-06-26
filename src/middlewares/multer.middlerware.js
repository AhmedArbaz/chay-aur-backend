//multer package file ko save karata hay kasay vo ais ko documentation kay github link say dakho diff types say save karata hay file ko memory may bhi disk may bhi to memory kam hoti hay ais liay ham disk may save karin gay 

import multer from "multer"


//express ko aisi liay use nahi kia kay aus may only req ,res hota hay to multer ak extra data hay file ka ager multer use nahi karty to express fileuploder kar latay vo bhi yahi file option data hay 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.originalname) //ya vapis ap multer ki documentation say same kar saktay ho code orignal ko hata hay 
    }
  })
  
//   const upload = multer({ storage: storage })

export const upload = multer({
    storage,
})