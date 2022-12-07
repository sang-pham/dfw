const secondDiffTime = (from, to) => {
  const time1 = new Date(from)
  const time2 = new Date(to)

  return Math.round((time2.getTime() - time1.getTime()) / 1000)
}

module.exports = {
  secondDiffTime
}