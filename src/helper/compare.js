const compareObject = (obj1, obj2) => {
  if (!obj1 && !obj2 && typeof obj1 === typeof obj2) {
    return true;
  }
  if (!Object.keys(obj1).length && !Object.keys(obj2).length) {
    return true;
  }
  for (const key in obj1) {
    if (obj1[key] != obj2[key]) {
      return false
    }
  }

  return true;
}

const checkIncludeObject = (wrapperObj, includedObj) => {
  if (!obj1 && !obj2 && typeof obj1 === typeof obj2) {
    return true;
  }
  if (!Object.keys(obj1).length && !Object.keys(obj2).length) {
    return true;
  }
  for (const key in includedObj) {
    if (includedObj[key] != wrapperObjp[key]) {
      return false
    }
  }
  return true
}

module.exports = {
  compareObject,
  checkIncludeObject
}