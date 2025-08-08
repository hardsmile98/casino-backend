const areObjectArraysEqual = (arr1: any[], arr2: any[]): boolean => {
  if (arr1?.length !== arr2?.length) return false

  return arr1.every((obj, index) => {
    const other = arr2[index]

    return obj.color === other.color && obj.result === other.result
  })
}

const getInsertedAtStart = (arr1: any[], arr2: any[]): any[] => {
  for (let shift = 0; shift < arr2.length; shift++) {
    let isMatch = true

    for (let i = 0; i < arr1.length - shift; i++) {
      const a = arr1[i]

      const b = arr2[i + shift]
      if (b === undefined || a.result !== b.result) {
        isMatch = false
        break
      }
    }
    if (isMatch) {
      return arr2.slice(0, shift)
    }
  }
  return []
}

export { areObjectArraysEqual, getInsertedAtStart }
