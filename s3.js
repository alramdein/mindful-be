require('dotenv').config()
const bucketName = process.env.S3_BUCKET_NAME
const accessKeyId = process.env.S3_BUCKET_ACCESS_KEY
const secretAccessKey = process.env.S3_BUCKET_ACCESS_SECRET
const region = process.env.S3_BUCKET_REGION

var S3 = require('aws-sdk/clients/s3')
const fs = require("fs")


const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey
})

//upload a file to s3
async function uploadFile(file) {
  let fileStream = fs.createReadStream(file.path)

  const uploadParams = {
    Bucket: bucketName, 
    Key: file.filename, 
    Body: fileStream
  }

  let uploadedData = await s3.upload(uploadParams).promise();
  return uploadedData;
}
exports.uploadFile = uploadFile


//download a file from s3
 function getFileStream(fileKey) {
  const downloadParams = {
      Bucket: bucketName,
      Key: fileKey,
  }

  // let fileStream = await s3.getObject(downloadParams).promise()
  return s3.getObject(downloadParams).createReadStream()
}
exports.getFileStream = getFileStream