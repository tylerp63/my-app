export default function formatTotal(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs === 0) {
    if (mins > 1) {
      return `${mins} minutes`;
    } else if (mins === 0) {
      if (seconds === 1) {
        return `${seconds} second`;
      }
      return `${seconds} seconds`;
    } else return `${mins} minute`;
  }
  return `${hrs} hours, ${mins} minutes`;
}
