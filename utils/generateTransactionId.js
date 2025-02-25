const generateTransactionId = () => {
    const timestamp = Date.now().toString(36); 
    const randomString = Math.random().toString(36).substring(2, 8); 
    return `TX${timestamp}${randomString}`.toUpperCase(); 
  };
  module.exports=generateTransactionId;