require('dotenv').config()
const fs = require('fs')
const S3 = require('aws-sdk/clients/s3')

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY


const s3 = new S3 ({
    region,
    accessKeyId,
    secretAccessKey
})

function uploadFile(file) {
    const fileStream = fs.createReadStream(file.path)

    const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: file.filename
    }

    return s3.upload(uploadParams).promise()
}

const getFile = async (fileKey) => {
    const downloadParams = {
        Key: fileKey,
        Bucket: bucketName
    }

    const data = await s3.getObject(downloadParams).promise()
    return data.Body
}

module.exports = {uploadFile,getFile}