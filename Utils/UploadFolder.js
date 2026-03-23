 const setUploadFolder = (folderName) => {
    return (req, res, next) => {
      req.headers["folder"] = folderName;
      next();
    };
  };
  

  module.exports = setUploadFolder;
