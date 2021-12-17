const upload = multer({
    //dest: 'images',
    limits:{fileSize:100},//restriction
    fileFilter(req,file,cb){
        if(!file.originalname.endsWith('.pdf'))//we can usefile.originalname.match(/\.(jpg|jpeg|png )$/)
      {return cb(new Error('must be pdf'))}
    }
})