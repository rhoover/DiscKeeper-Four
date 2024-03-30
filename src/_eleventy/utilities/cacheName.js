let newName = () => {

  // declare all characters
  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = ' ';
  const charactersLength = characters.length;
  for ( let i = 0; i < 7; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  result.toString();
  let cacheName = `disckeeperCache-${result}`;
  return cacheName
};


module.exports = newName();