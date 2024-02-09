module.exports = function(incomingDate) {
  return `${incomingDate.getMonth()+1}/${incomingDate.getDate()}/${incomingDate.getFullYear()}`;
};