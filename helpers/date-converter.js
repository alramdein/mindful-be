const convertToMySQLDate = (dateString) => {
    return dateString.replace(/T/g, " ").replace(/Z/g, "");
  };
  
  module.exports = {
    convertToMySQLDate,
  };
  