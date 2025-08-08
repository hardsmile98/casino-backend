import { areObjectArraysEqual, getInsertedAtStart } from '@/helpers'

/* eslint-disable @typescript-eslint/naming-convention */
export interface ResultTable {
  provaiderName: string
  tableId: string
  tableName: string
  tableImage: string
  resultGames: Array<{
    color: string
    result: number
  }>
  href: string
  groupStats?: GroupStats
}

export interface GroupStats {
  day: string
  group1_12: number
  group13_24: number
  group25_36: number
  day_group1_12: number
  day_group13_24: number
  day_group25_36: number
}

let result: Record<string, ResultTable> = {}

const calculateGroupStats = (
  tableId: string,
  resultGames: Array<{
    color: string
    result: number
  }>): GroupStats => {
  const currentDay = new Date().toLocaleDateString()

  if (result[tableId]?.groupStats === undefined) {
    let group1_12 = 0
    let group13_24 = 0
    let group25_36 = 0

    let writeEnabled1_12 = true
    let writeEnabled13_24 = true
    let writeEnabled25_36 = true

    resultGames.forEach(({ result: resultString }) => {
      const result = +resultString

      switch (true) {
        case (result === 0): {
          group1_12 = writeEnabled1_12 ? group1_12 + 1 : group1_12
          group13_24 = writeEnabled13_24 ? group13_24 + 1 : group13_24
          group25_36 = writeEnabled25_36 ? group25_36 + 1 : group25_36
          break
        }
        case (result > 0 && result < 13): {
          group13_24 = writeEnabled13_24 ? group13_24 + 1 : group13_24
          group25_36 = writeEnabled25_36 ? group25_36 + 1 : group25_36
          writeEnabled1_12 = false
          break
        }
        case (result > 12 && result < 25): {
          group25_36 = writeEnabled25_36 ? group25_36 + 1 : group25_36
          group1_12 = writeEnabled1_12 ? group1_12 + 1 : group1_12
          writeEnabled13_24 = false
          break
        }
        case (result > 24): {
          group1_12 = writeEnabled1_12 ? group1_12 + 1 : group1_12
          group13_24 = writeEnabled13_24 ? group13_24 + 1 : group13_24
          writeEnabled25_36 = false
          break
        }
        default:
          break
      }
    })

    return {
      group1_12,
      group13_24,
      group25_36,
      day: currentDay,
      day_group1_12: group1_12,
      day_group13_24: group13_24,
      day_group25_36: group25_36
    }
  }

  const insertedAtStart = getInsertedAtStart(result[tableId].resultGames, resultGames)

  if (insertedAtStart.length > 0) {
    let group1_12 = result[tableId].groupStats.group1_12
    let group13_24 = result[tableId].groupStats.group13_24
    let group25_36 = result[tableId].groupStats.group25_36

    insertedAtStart.forEach(({ result: resultString }) => {
      const result = +resultString

      switch (true) {
        case (result === 0): {
          group1_12 = group1_12 + 1
          group13_24 = group13_24 + 1
          group25_36 = group25_36 + 1
          break
        }
        case (result > 0 && result < 13): {
          group13_24 = group13_24 + 1
          group25_36 = group25_36 + 1
          group1_12 = 0
          break
        }
        case (result > 12 && result < 25): {
          group25_36 = group25_36 + 1
          group1_12 = group1_12 + 1
          group13_24 = 0
          break
        }
        case (result > 24): {
          group1_12 = group1_12 + 1
          group13_24 = group13_24 + 1
          group25_36 = 0
          break
        }
        default:
          break
      }
    })

    let day_group1_12 = result[tableId].groupStats.day_group1_12
    let day_group13_24 = result[tableId].groupStats.day_group13_24
    let day_group25_36 = result[tableId].groupStats.day_group25_36

    if (currentDay !== result[tableId].groupStats.day) {
      day_group1_12 = 0
      day_group13_24 = 0
      day_group25_36 = 0
    } else {
      if (group1_12 > result[tableId].groupStats.day_group1_12) {
        day_group1_12 = group1_12
      }
      if (group13_24 > result[tableId].groupStats.day_group13_24) {
        day_group13_24 = group13_24
      }
      if (group25_36 > result[tableId].groupStats.day_group25_36) {
        day_group25_36 = group25_36
      }
    }

    return {
      group1_12,
      group13_24,
      group25_36,
      day: currentDay,
      day_group1_12,
      day_group13_24,
      day_group25_36
    }
  }

  return result[tableId].groupStats
}

const setTableResult = (tableId: string, resultTable: ResultTable): boolean => {
  if (!areObjectArraysEqual(result[tableId]?.resultGames, resultTable.resultGames)) {
    result[tableId] = {
      ...resultTable,
      groupStats: calculateGroupStats(tableId, resultTable.resultGames)
    }

    return true
  }

  return false
}

const getTableResult = (tableId: string): ResultTable => {
  return result[tableId]
}

const getResult = (): Record<string, ResultTable> => {
  return result
}

const resetResult = (): void => {
  result = {}
}

export { setTableResult, getTableResult, getResult, resetResult }
