const SECONDS_IN_DAY = 24 * 60 * 60

/**
 * Given start and end timestamp (in seconds), produce day numbers
 * This is relevant for nostr "D" tag:
 *
 * https://github.com/nostr-protocol/nips/blob/master/52.md#time-based-calendar-event
 *
 * D (required)
 * the day-granularity unix timestamp on which the event takes place,
 * calculated as floor(unix_seconds() / seconds_in_one_day).
 * Multiple tags SHOULD be included to cover the event's timeframe.
 *
 * @param startTimestamp
 * @param endTimestamp
 * @returns
 */
export function dayRangeSinceEpoch(
  startTimestamp: number,
  endTimestamp: number,
): number[] {
  if (endTimestamp < startTimestamp)
    throw new Error(
      `endTimestamp (${endTimestamp}) must be >= startTimestamp (${startTimestamp})`,
    )

  const startDay = Math.floor(startTimestamp / SECONDS_IN_DAY)
  const endDay = Math.floor(endTimestamp / SECONDS_IN_DAY)

  const days: number[] = []
  for (let day = startDay; day <= endDay; day++) {
    days.push(day)
  }

  return days
}
