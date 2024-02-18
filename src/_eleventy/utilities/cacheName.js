let newName = () => {
  let result = Math.random().toString(36).substring(2,9);
  result.toString();
  let cacheName = `cacheName-${result}`;
  return cacheName
};


module.exports = newName();